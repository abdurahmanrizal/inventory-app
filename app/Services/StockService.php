<?php

namespace App\Services;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\StockTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function __construct(private readonly InventoryValuationService $valuation) {}

    public function approveAndPost(StockTransaction $transaction, int $managerId, ?string $remarks = null): StockTransaction
    {
        return DB::transaction(function () use ($transaction, $managerId, $remarks) {
            $transaction = StockTransaction::query()->with(['details', 'approvals'])->lockForUpdate()->findOrFail($transaction->id);
            if ($transaction->status !== TransactionStatus::WaitingApproval) {
                throw ValidationException::withMessages(['status' => 'Transaksi tidak berada pada status menunggu persetujuan.']);
            }
            $activeApproval = $transaction->approvals()->where('status', 'pending')->orderBy('level')->lockForUpdate()->first();
            if ($activeApproval && $activeApproval->approver_id !== $managerId) {
                throw ValidationException::withMessages(['approval' => 'Anda bukan approver aktif untuk transaksi ini.']);
            }
            if ($activeApproval) {
                $activeApproval->update(['status' => 'approved', 'remarks' => $remarks, 'acted_at' => now()]);
            }

            $hasPendingApprovals = $transaction->approvals()->where('status', 'pending')->exists();
            if ($hasPendingApprovals) {
                $nextApproverId = $transaction->approvals()->where('status', 'pending')->orderBy('level')->value('approver_id');
                $transaction->update(['assigned_approver_id' => $nextApproverId]);

                return $transaction->fresh(['details', 'sourceWarehouse', 'destinationWarehouse', 'approvals.approver']);
            }

            foreach ($transaction->details as $detail) {
                match ($transaction->type) {
                    TransactionType::StockIn => $this->increase($transaction, $transaction->destination_warehouse_id, $detail, (float) $detail->unit_cost, $managerId),
                    TransactionType::StockOut => $this->decrease($transaction, $transaction->source_warehouse_id, $detail, $managerId),
                    TransactionType::Transfer => $this->transfer($transaction, $detail, $managerId),
                    default => throw ValidationException::withMessages(['type' => 'Jenis transaksi belum didukung oleh service posting.']),
                };
            }
            $transaction->update(['status' => TransactionStatus::Completed, 'approved_by' => $managerId, 'approved_at' => now(), 'posted_at' => now()]);

            return $transaction->fresh(['details', 'sourceWarehouse', 'destinationWarehouse', 'approvals.approver']);
        });
    }

    public function reject(StockTransaction $transaction, int $managerId, string $remarks): void
    {
        DB::transaction(function () use ($transaction, $managerId, $remarks) {
            $transaction = StockTransaction::query()->with('approvals')->lockForUpdate()->findOrFail($transaction->id);
            if ($transaction->status !== TransactionStatus::WaitingApproval) {
                throw ValidationException::withMessages(['status' => 'Transaksi tidak berada pada status menunggu persetujuan.']);
            }
            $activeApproval = $transaction->approvals()->where('status', 'pending')->orderBy('level')->lockForUpdate()->first();
            if ($activeApproval && $activeApproval->approver_id !== $managerId) {
                throw ValidationException::withMessages(['approval' => 'Anda bukan approver aktif untuk transaksi ini.']);
            }
            if ($activeApproval) {
                $activeApproval->update(['status' => 'rejected', 'remarks' => $remarks, 'acted_at' => now()]);
            }
            $transaction->update(['status' => TransactionStatus::Rejected, 'approved_by' => $managerId, 'approved_at' => now()]);
        });
    }

    private function transfer(StockTransaction $tx, $detail, int $userId): void
    {
        $allocations = $this->decrease($tx, $tx->source_warehouse_id, $detail, $userId);
        foreach ($allocations as $allocation) {
            $this->valuation->receive(
                $tx->destination_warehouse_id, $detail->item_id, $allocation['qty'], $allocation['unit_cost'],
                $allocation['batch_no'], $allocation['expired_at'], null, null,
                'stock_transaction', $tx->id, $userId, $tx->id, false,
                $allocation['source_received_at'], $allocation['source_cost_layer_id'],
            );
        }
    }

    private function increase(StockTransaction $tx, int $warehouseId, $detail, float $incomingCost, int $userId): void
    {
        $this->valuation->receive(
            $warehouseId, $detail->item_id, (float) $detail->qty, $incomingCost,
            $detail->batch_no, $detail->expired_at, null, null,
            'stock_transaction', $tx->id, $userId, $tx->id,
        );
    }

    private function decrease(StockTransaction $tx, int $warehouseId, $detail, int $userId): array
    {
        return $this->valuation->issue(
            $warehouseId, $detail->item_id, (float) $detail->qty, $detail->batch_no,
            'stock_transaction', $tx->id, $userId, $tx->id,
        );
    }
}
