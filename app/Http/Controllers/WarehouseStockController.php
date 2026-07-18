<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseStockController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $canViewAll = $user->role === UserRole::Superadmin;
        abort_unless($canViewAll || $user->warehouse_id, 403, 'Akun belum terhubung dengan gudang atau unit.');

        $warehouseId = $canViewAll ? ($request->integer('warehouse_id') ?: null) : $user->warehouse_id;
        if ($canViewAll && $warehouseId) {
            abort_unless(Warehouse::whereKey($warehouseId)->exists(), 404);
        }

        $stocks = CurrentStock::with(['item:id,code,name,base_uom,min_stock,reorder_point,issue_method', 'warehouse:id,code,name,type', 'location:id,code,name'])
            ->when($warehouseId, fn ($query) => $query->where('warehouse_id', $warehouseId))
            ->orderBy('warehouse_id')->orderBy('item_id')->orderBy('expired_at')->get()
            ->map(fn (CurrentStock $stock) => [
                'id' => $stock->id, 'warehouse' => $stock->warehouse, 'item' => $stock->item, 'location' => $stock->location,
                'batch_no' => $stock->batch_no, 'expired_at' => $stock->expired_at?->format('Y-m-d'),
                'qty_on_hand' => (float) $stock->qty_on_hand, 'qty_reserved' => (float) $stock->qty_reserved,
                'qty_available' => $stock->qty_available, 'average_cost' => (float) $stock->average_cost,
                'stock_value' => (float) $stock->qty_on_hand * (float) $stock->average_cost,
            ]);

        return Inertia::render('WarehouseStock/Index', [
            'stocks' => $stocks,
            'warehouses' => $canViewAll ? Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'code', 'name', 'type']) : [],
            'selectedWarehouse' => $warehouseId, 'canViewAll' => $canViewAll,
            'summary' => ['items' => $stocks->count(), 'onHand' => $stocks->sum('qty_on_hand'), 'reserved' => $stocks->sum('qty_reserved'), 'available' => $stocks->sum('qty_available'), 'value' => $stocks->sum('stock_value')],
        ]);
    }
}
