<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatus;
use App\Enums\UserRole;
use App\Models\StockTransaction;
use App\Models\Warehouse;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApprovalController extends Controller
{
    public function index(Request $request)
    {
        $query = StockTransaction::with(['details.item:id,code,name', 'sourceWarehouse:id,name', 'destinationWarehouse:id,name', 'creator:id,name'])
            ->where('status', TransactionStatus::WaitingApproval);

        $isSuperadmin = $request->user()->role === UserRole::Superadmin;
        if (! $isSuperadmin) {
            abort_unless($request->user()->role === UserRole::UnitManager, 403);
            $query->where('assigned_approver_id', $request->user()->id);
        } elseif ($request->filled('warehouse_id')) {
            $warehouseId = $request->integer('warehouse_id');
            abort_unless(Warehouse::whereKey($warehouseId)->exists(), 404);
            $query->where(fn ($builder) => $builder->where('source_warehouse_id', $warehouseId)->orWhere('destination_warehouse_id', $warehouseId));
        }

        return Inertia::render('Approvals/Index', [
            'transactions' => $query->latest()->paginate(15)->withQueryString(),
            'warehouses' => $isSuperadmin ? Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'code', 'name', 'type']) : [],
            'canFilterWarehouse' => $isSuperadmin,
            'selectedWarehouse' => $isSuperadmin ? ($request->integer('warehouse_id') ?: null) : $request->user()->warehouse_id,
        ]);
    }

    public function approve(Request $request, StockTransaction $transaction, StockService $service)
    {
        $this->authorizeApprover($request, $transaction);
        $service->approveAndPost($transaction, $request->user()->id, $request->input('remarks'));
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi disetujui dan stok berhasil diposting.']);

        return back();
    }

    public function reject(Request $request, StockTransaction $transaction, StockService $service)
    {
        $this->authorizeApprover($request, $transaction);
        $data = $request->validate(['remarks' => 'required|string|min:5']);
        $service->reject($transaction, $request->user()->id, $data['remarks']);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi berhasil ditolak.']);

        return back();
    }

    private function authorizeApprover(Request $request, StockTransaction $transaction): void
    {
        $allowed = $request->user()->role === UserRole::Superadmin
            || ($request->user()->role === UserRole::UnitManager && $transaction->assigned_approver_id === $request->user()->id);
        abort_unless($allowed, 403);
    }
}
