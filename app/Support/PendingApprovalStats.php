<?php

namespace App\Support;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\StockAdjustment;
use App\Models\StockRequest;
use App\Models\StockTransaction;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkflowApproval;
use Illuminate\Support\Collection;

final class PendingApprovalStats
{
    /**
     * Daftar gudang utama aktif beserta jumlah approval pending yang
     * menunggu tindakan user warehouse_manager, per gudang utama.
     *
     * @return array{mainWarehouses: Collection, counts: Collection<int, int>}
     */
    public static function forWarehouseManager(User $user): array
    {
        $main = Warehouse::query()
            ->where('type', 'main')
            ->where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'code', 'name']);

        if ($user->role !== UserRole::WarehouseManager) {
            return ['main' => $main, 'counts' => $main->mapWithKeys(fn ($warehouse) => [$warehouse->id => 0])];
        }

        $counts = $main->mapWithKeys(function (Warehouse $warehouse) {
            $mainApproverIds = ApproverResolver::mainWarehouseApproverIds();
            $transactionCount = StockTransaction::query()
                ->where('status', TransactionStatus::WaitingApproval)
                ->whereIn('assigned_approver_id', $mainApproverIds)
                ->where(function ($query) use ($warehouse) {
                    $query->where(fn ($query) => $query
                        ->where('type', TransactionType::StockIn->value)
                        ->where('destination_warehouse_id', $warehouse->id))
                        ->orWhere(fn ($query) => $query
                            ->where('type', '!=', TransactionType::StockIn->value)
                            ->where(fn ($query) => $query
                                ->where('source_warehouse_id', $warehouse->id)
                                ->orWhere(function ($query) use ($warehouse) {
                                    $query->whereNull('source_warehouse_id')->where('destination_warehouse_id', $warehouse->id);
                                })));
                })
                ->count();

            $workflowCount = WorkflowApproval::query()
                ->whereIn('module', ['stock_request', 'stock_adjustment'])
                ->where('status', 'pending')
                ->whereHas('steps', fn ($query) => $query
                    ->whereColumn('level', 'workflow_approvals.current_level')
                    ->where('status', 'pending')
                    ->whereIn('approver_id', $mainApproverIds))
                ->where(function ($query) use ($warehouse) {
                    $query->whereIn('transaction_id', StockRequest::query()->where('from_warehouse_id', $warehouse->id)->select('id'))
                        ->orWhereIn('transaction_id', StockAdjustment::query()->where('warehouse_id', $warehouse->id)->select('id'));
                })
                ->count();

            return [$warehouse->id => $transactionCount + $workflowCount];
        });

        return ['main' => $main, 'counts' => $counts];
    }
}
