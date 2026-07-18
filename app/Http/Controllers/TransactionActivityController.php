<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\StockLedger;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TransactionActivityController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $isSuperadmin = $user->role === UserRole::Superadmin;
        abort_unless($isSuperadmin || $user->role === UserRole::UnitManager, 403);
        abort_unless($isSuperadmin || $user->warehouse_id, 403, 'Manajer belum terhubung dengan gudang atau unit.');

        $warehouseId = $isSuperadmin ? ($request->integer('warehouse_id') ?: null) : $user->warehouse_id;
        $query = StockLedger::with(['warehouse:id,code,name,type', 'item:id,code,name,base_uom', 'creator:id,name', 'stockTransaction:id,number,type,stock_out_reason'])
            ->when($warehouseId, fn ($builder) => $builder->where('warehouse_id', $warehouseId))
            ->when($request->filled('direction'), fn ($builder) => $builder->where('direction', $request->string('direction')))
            ->when($request->filled('reference_type'), fn ($builder) => $builder->where('reference_type', $request->string('reference_type')))
            ->when($request->filled('date_from'), fn ($builder) => $builder->whereDate('created_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($builder) => $builder->whereDate('created_at', '<=', $request->date('date_to')))
            ->when($request->filled('search'), function ($builder) use ($request) {
                $search = '%'.$request->string('search')->trim().'%';
                $builder->where(fn ($q) => $q->where('batch_no', 'like', $search)
                    ->orWhereHas('item', fn ($item) => $item->where('name', 'like', $search)->orWhere('code', 'like', $search))
                    ->orWhereHas('stockTransaction', fn ($transaction) => $transaction->where('number', 'like', $search)));
            });

        $summaryQuery = clone $query;
        $activities = $query->latest('created_at')->paginate(20)->withQueryString();

        return Inertia::render('TransactionActivity/Index', [
            'activities' => $activities,
            'warehouses' => $isSuperadmin ? Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'code', 'name', 'type']) : [],
            'canFilterWarehouse' => $isSuperadmin,
            'activeWarehouse' => $isSuperadmin ? null : $user->warehouse?->only(['id', 'code', 'name', 'type']),
            'filters' => $request->only(['warehouse_id', 'direction', 'reference_type', 'date_from', 'date_to', 'search']),
            'summary' => [
                'count' => (clone $summaryQuery)->count(),
                'qtyIn' => (float) (clone $summaryQuery)->where('direction', 'in')->sum('qty'),
                'qtyOut' => (float) (clone $summaryQuery)->where('direction', 'out')->sum('qty'),
                'value' => (float) (clone $summaryQuery)->selectRaw('COALESCE(SUM(qty * unit_cost), 0) as total')->value('total'),
            ],
        ]);
    }
}
