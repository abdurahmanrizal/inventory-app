<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatus;
use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\InventorySetting;
use App\Models\StockCostLayer;
use App\Models\StockRequest;
use App\Models\StockTransaction;
use App\Models\Warehouse;
use App\Services\InventoryReportService;
use App\Support\WarehouseScope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function __invoke(Request $request, InventoryReportService $reports)
    {
        $user = $request->user()->load('warehouse');
        $isSuperadmin = $user->role === UserRole::Superadmin;
        $isFinance = $user->role === UserRole::Finance;
        $canViewAll = $isSuperadmin || $isFinance;
        $isMainWarehouseManager = $user->role === UserRole::WarehouseManager;
        $isMainWarehouseAccount = $user->warehouse?->type === 'main'
            && ($user->role?->isWarehouseAdmin() || $user->role?->isTransactionApprover());

        $warehouseIds = match (true) {
            $canViewAll => Warehouse::where('is_active', true)->pluck('id'),
            $isMainWarehouseManager => WarehouseScope::activeMainNetworks(),
            $isMainWarehouseAccount => Warehouse::where('is_active', true)
                ->where(fn (Builder $query) => $query
                    ->where('id', $user->warehouse_id)
                    ->orWhere('main_warehouse_id', $user->warehouse_id))
                ->pluck('id'),
            default => collect([$user->warehouse_id])->filter(),
        };

        $stockQuery = CurrentStock::query()->whereIn('warehouse_id', $warehouseIds);
        $transactionScope = fn (Builder $query) => $query->where(fn (Builder $scope) => $scope
            ->whereIn('source_warehouse_id', $warehouseIds)
            ->orWhereIn('destination_warehouse_id', $warehouseIds));
        $requestScope = fn (Builder $query) => $query->where(fn (Builder $scope) => $scope
            ->whereIn('from_warehouse_id', $warehouseIds)
            ->orWhereIn('to_warehouse_id', $warehouseIds));

        $stockValue = InventorySetting::current()->valuation_method->value === 'fifo'
            ? StockCostLayer::query()->whereIn('warehouse_id', $warehouseIds)
                ->selectRaw('COALESCE(SUM(remaining_qty * unit_cost), 0) AS total')->value('total')
            : (clone $stockQuery)->selectRaw('COALESCE(SUM(qty_on_hand * average_cost), 0) AS total')->value('total');
        $legacyPending = StockTransaction::query()
            ->where('status', TransactionStatus::WaitingApproval)
            ->when(! $canViewAll, $transactionScope)
            ->count();
        $requestPending = StockRequest::query()
            ->where('status', 'waiting_approval')
            ->when(! $canViewAll, $requestScope)
            ->count();

        $stockTransactions = StockTransaction::with(['sourceWarehouse:id,name', 'destinationWarehouse:id,name'])
            ->when(! $canViewAll, $transactionScope)
            ->latest('updated_at')->limit(8)->get()
            ->map(fn (StockTransaction $transaction) => [
                'id' => 'transaction-'.$transaction->id,
                'number' => $transaction->number,
                'type' => $transaction->type->value,
                'status' => $transaction->status->value,
                'source_warehouse' => $transaction->sourceWarehouse,
                'destination_warehouse' => $transaction->destinationWarehouse,
                'date' => $transaction->document_date,
                'sort_date' => $transaction->updated_at,
            ]);
        $stockRequests = StockRequest::with(['fromWarehouse:id,name', 'toWarehouse:id,name'])
            ->when(! $canViewAll, $requestScope)
            ->latest('updated_at')->limit(8)->get()
            ->map(fn (StockRequest $stockRequest) => [
                'id' => 'request-'.$stockRequest->id,
                'number' => $stockRequest->number,
                'type' => 'stock_request',
                'status' => $stockRequest->status,
                'source_warehouse' => $stockRequest->fromWarehouse,
                'destination_warehouse' => $stockRequest->toWarehouse,
                'date' => $stockRequest->request_date,
                'sort_date' => $stockRequest->updated_at,
            ]);

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'stockValue' => (float) $stockValue,
                'stockQty' => (float) (clone $stockQuery)->sum('qty_on_hand'),
                'pendingApproval' => $legacyPending + $requestPending,
                'lowStock' => (clone $stockQuery)->whereColumn('qty_on_hand', '<=', 'qty_reserved')->count(),
            ],
            'recent' => $stockTransactions->concat($stockRequests)
                ->sortByDesc('sort_date')->take(8)->values(),
            'scopeLabel' => $canViewAll
                ? 'Seluruh gudang dan unit'
                : ($isMainWarehouseManager
                    ? 'Gudang utama kering/basah dan seluruh unit terkait'
                    : ($isMainWarehouseAccount
                    ? $user->warehouse->name.' dan unit terkait'
                    : 'Transaksi dan persediaan '.$user->warehouse?->name)),
            'quickActions' => [
                'stockIn' => $user->hasPermission('stock.in') && ($isSuperadmin || $user->role?->isWarehouseAdmin()),
                'stockOut' => $user->hasPermission('stock.out') && ($isSuperadmin || $user->role?->isWarehouseAdmin() || $user->role === UserRole::UnitUser),
                'stockRequest' => $user->hasPermission('stock.request') && $user->role === UserRole::UnitUser,
            ],
            'financeSummary' => $isFinance ? $this->financeSummary($reports, $warehouseIds) : null,
        ]);
    }

    private function financeSummary(InventoryReportService $reports, $warehouseIds): array
    {
        $filters = [
            'date_from' => now()->startOfMonth()->format('Y-m-d'),
            'date_to' => now()->format('Y-m-d'),
        ];
        $valuation = $reports->valuation($warehouseIds, null);
        $movement = $reports->financialMovement($warehouseIds, null, $filters);
        $anomalies = $reports->anomalies($warehouseIds, null);

        return [
            'valuationMethod' => InventorySetting::current()->valuation_method->value,
            'inventoryValue' => (float) $valuation['summary']['value'],
            'warehouseValues' => $valuation['warehouses'],
            'outgoingCost' => (float) $movement['summary']['outgoingValue'],
            'reconciliationDifference' => (float) ($movement['summary']['difference'] ?? 0),
            'anomalyCount' => (int) $anomalies['summary']['issues'],
            'periodLabel' => now()->translatedFormat('F Y'),
        ];
    }
}
