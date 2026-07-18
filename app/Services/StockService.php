<?php
namespace App\Services;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Models\CurrentStock;
use App\Models\StockLedger;
use App\Models\StockTransaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockService
{
    public function approveAndPost(StockTransaction $transaction, int $managerId, ?string $remarks = null): StockTransaction
    {
        return DB::transaction(function () use ($transaction, $managerId, $remarks) {
            $transaction = StockTransaction::query()->with('details')->lockForUpdate()->findOrFail($transaction->id);
            if ($transaction->status !== TransactionStatus::WaitingApproval) {
                throw ValidationException::withMessages(['status' => 'Transaksi tidak berada pada status menunggu persetujuan.']);
            }
            foreach ($transaction->details as $detail) {
                match ($transaction->type) {
                    TransactionType::StockIn => $this->increase($transaction, $transaction->destination_warehouse_id, $detail, (float)$detail->unit_cost, $managerId),
                    TransactionType::StockOut => $this->decrease($transaction, $transaction->source_warehouse_id, $detail, $managerId),
                    TransactionType::Transfer => $this->transfer($transaction, $detail, $managerId),
                    default => throw ValidationException::withMessages(['type' => 'Jenis transaksi belum didukung oleh service posting.']),
                };
            }
            $transaction->update(['status'=>TransactionStatus::Completed,'approved_by'=>$managerId,'approved_at'=>now(),'posted_at'=>now()]);
            $transaction->approvals()->create(['level'=>1,'approver_id'=>$managerId,'status'=>'approved','remarks'=>$remarks,'acted_at'=>now()]);
            return $transaction->fresh(['details','sourceWarehouse','destinationWarehouse']);
        });
    }

    public function reject(StockTransaction $transaction, int $managerId, string $remarks): void
    {
        DB::transaction(function () use ($transaction, $managerId, $remarks) {
            $transaction->lockForUpdate();
            $transaction->update(['status'=>TransactionStatus::Rejected,'approved_by'=>$managerId,'approved_at'=>now()]);
            $transaction->approvals()->create(['level'=>1,'approver_id'=>$managerId,'status'=>'rejected','remarks'=>$remarks,'acted_at'=>now()]);
        });
    }

    private function transfer(StockTransaction $tx, $detail, int $userId): void
    {
        $cost = $this->decrease($tx, $tx->source_warehouse_id, $detail, $userId);
        $this->increase($tx, $tx->destination_warehouse_id, $detail, $cost, $userId);
    }

    private function increase(StockTransaction $tx, int $warehouseId, $detail, float $incomingCost, int $userId): void
    {
        $stock = CurrentStock::query()->lockForUpdate()->firstOrCreate(
            ['warehouse_id'=>$warehouseId,'item_id'=>$detail->item_id,'batch_no'=>$detail->batch_no],
            ['expired_at'=>$detail->expired_at,'qty_on_hand'=>0,'qty_reserved'=>0,'average_cost'=>0]
        );
        $oldQty=(float)$stock->qty_on_hand; $qty=(float)$detail->qty;
        $newQty=$oldQty+$qty;
        $newCost=$newQty > 0 ? (($oldQty*(float)$stock->average_cost)+($qty*$incomingCost))/$newQty : $incomingCost;
        $stock->update(['qty_on_hand'=>$newQty,'average_cost'=>$newCost,'expired_at'=>$detail->expired_at]);
        $this->ledger($tx,$warehouseId,$detail,'in',$qty,$incomingCost,$newQty,$newCost,$userId);
    }

    private function decrease(StockTransaction $tx, int $warehouseId, $detail, int $userId): float
    {
        $stock=CurrentStock::query()->where(['warehouse_id'=>$warehouseId,'item_id'=>$detail->item_id,'batch_no'=>$detail->batch_no])->lockForUpdate()->first();
        $qty=(float)$detail->qty;
        if (!$stock || (float)$stock->qty_on_hand < $qty) {
            throw ValidationException::withMessages(['stock' => "Stok item {$detail->item_id} tidak mencukupi."]);
        }
        $cost=(float)$stock->average_cost; $newQty=(float)$stock->qty_on_hand-$qty;
        $stock->update(['qty_on_hand'=>$newQty]);
        $this->ledger($tx,$warehouseId,$detail,'out',$qty,$cost,$newQty,$cost,$userId);
        return $cost;
    }

    private function ledger($tx,int $warehouseId,$detail,string $direction,float $qty,float $cost,float $balanceQty,float $balanceCost,int $userId): void
    {
        StockLedger::create(['stock_transaction_id'=>$tx->id,'warehouse_id'=>$warehouseId,'item_id'=>$detail->item_id,'batch_no'=>$detail->batch_no,'expired_at'=>$detail->expired_at,'direction'=>$direction,'qty'=>$qty,'unit_cost'=>$cost,'balance_qty'=>$balanceQty,'balance_cost'=>$balanceCost,'created_by'=>$userId,'created_at'=>now()]);
    }
}
