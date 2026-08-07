<?php

namespace App\Services;

use App\Enums\InventoryValuationMethod;
use App\Models\CurrentStock;
use App\Models\InventorySetting;
use App\Models\StockCostLayer;
use App\Models\StockLedger;
use Illuminate\Validation\ValidationException;

class InventoryValuationService
{
    public function method(): InventoryValuationMethod
    {
        return InventorySetting::current()->valuation_method;
    }

    public function currentInboundCost(int $warehouseId, int $itemId, ?string $batch = null): float
    {
        if ($this->method() === InventoryValuationMethod::Fifo) {
            return (float) StockCostLayer::query()
                ->where('warehouse_id', $warehouseId)
                ->where('item_id', $itemId)
                ->when($batch !== null, fn ($query) => $query->where('batch_no', $batch))
                ->where('remaining_qty', '>', 0)
                ->latest('received_at')
                ->latest('id')
                ->value('unit_cost');
        }

        return (float) CurrentStock::query()
            ->where('warehouse_id', $warehouseId)
            ->where('item_id', $itemId)
            ->when($batch !== null, fn ($query) => $query->where('batch_no', $batch))
            ->where('qty_on_hand', '>', 0)
            ->selectRaw('COALESCE(SUM(qty_on_hand * average_cost) / NULLIF(SUM(qty_on_hand), 0), 0) as cost')
            ->value('cost');
    }

    public function receive(
        int $warehouseId,
        int $itemId,
        float $qty,
        float $cost,
        ?string $batch,
        mixed $expired,
        ?int $locationId,
        ?int $uomId,
        string $referenceType,
        int $referenceId,
        int $userId,
        ?int $stockTransactionId = null,
        bool $followSourceCost = false,
        mixed $receivedAt = null,
        ?int $sourceCostLayerId = null,
    ): void {
        $this->lockSetting();
        $stock = CurrentStock::query()->lockForUpdate()->firstOrCreate(
            ['warehouse_id' => $warehouseId, 'item_id' => $itemId, 'batch_no' => $batch],
            ['location_id' => $locationId, 'uom_id' => $uomId, 'expired_at' => $expired, 'qty_on_hand' => 0, 'qty_reserved' => 0, 'average_cost' => 0],
        );
        $oldQty = (float) $stock->qty_on_hand;
        $newQty = $oldQty + $qty;

        $costLayerId = null;
        if ($this->method() === InventoryValuationMethod::Fifo) {
            $costLayer = StockCostLayer::create([
                'source_cost_layer_id' => $sourceCostLayerId,
                'warehouse_id' => $warehouseId, 'item_id' => $itemId, 'batch_no' => $batch,
                'expired_at' => $expired, 'received_at' => $receivedAt ?? now(), 'original_qty' => $qty,
                'remaining_qty' => $qty, 'unit_cost' => $cost,
                'reference_type' => $referenceType, 'reference_id' => $referenceId,
            ]);
            $costLayerId = $costLayer->id;
            $newCost = $this->fifoBalanceCost($warehouseId, $itemId, $batch);
        } else {
            $newCost = $followSourceCost
                ? $cost
                : ($newQty > 0
                ? (($oldQty * (float) $stock->average_cost) + ($qty * $cost)) / $newQty
                : 0);
        }

        $stock->update([
            'qty_on_hand' => $newQty, 'average_cost' => $newCost,
            'expired_at' => $expired ?? $stock->expired_at,
            'location_id' => $locationId ?? $stock->location_id,
            'uom_id' => $uomId ?? $stock->uom_id,
        ]);
        $this->ledger($stock->fresh(), 'in', $qty, $cost, $referenceType, $referenceId, $userId, $stockTransactionId, $costLayerId, $costLayerId ? $qty : null);
    }

    /** @return array<int, array{qty: float, unit_cost: float, batch_no: ?string, expired_at: mixed, source_cost_layer_id: ?int, source_received_at: mixed}> */
    public function issue(
        int $warehouseId,
        int $itemId,
        float $qty,
        ?string $batch,
        string $referenceType,
        int $referenceId,
        int $userId,
        ?int $stockTransactionId = null,
    ): array {
        $this->lockSetting();

        return $this->method() === InventoryValuationMethod::Fifo
            ? $this->issueFifo($warehouseId, $itemId, $qty, $batch, $referenceType, $referenceId, $userId, $stockTransactionId)
            : $this->issueMovingAverage($warehouseId, $itemId, $qty, $batch, $referenceType, $referenceId, $userId, $stockTransactionId);
    }

    private function issueMovingAverage(int $warehouseId, int $itemId, float $qty, ?string $batch, string $referenceType, int $referenceId, int $userId, ?int $stockTransactionId): array
    {
        $stocks = CurrentStock::query()->where('warehouse_id', $warehouseId)->where('item_id', $itemId)
            ->when($batch !== null, fn ($query) => $query->where('batch_no', $batch))
            ->where('qty_on_hand', '>', 0)->orderByRaw('expired_at IS NULL, expired_at')->orderBy('created_at')->lockForUpdate()->get();
        $remaining = $qty;
        $allocations = [];
        foreach ($stocks as $stock) {
            if ($remaining <= 0) {
                break;
            }
            $take = min($remaining, (float) $stock->qty_on_hand);
            $cost = (float) $stock->average_cost;
            $this->reduceStock($stock, $take);
            $this->ledger($stock->fresh(), 'out', $take, $cost, $referenceType, $referenceId, $userId, $stockTransactionId);
            $allocations[] = [
                'qty' => $take, 'unit_cost' => $cost, 'batch_no' => $stock->batch_no, 'expired_at' => $stock->expired_at,
                'source_cost_layer_id' => null, 'source_received_at' => null,
            ];
            $remaining -= $take;
        }
        $this->ensureEnough($remaining);

        return $allocations;
    }

    private function issueFifo(int $warehouseId, int $itemId, float $qty, ?string $batch, string $referenceType, int $referenceId, int $userId, ?int $stockTransactionId): array
    {
        $layers = StockCostLayer::query()->where('warehouse_id', $warehouseId)->where('item_id', $itemId)
            ->when($batch !== null, fn ($query) => $query->where('batch_no', $batch))
            ->where('remaining_qty', '>', 0)->orderBy('received_at')->orderBy('id')->lockForUpdate()->get();
        $remaining = $qty;
        $allocations = [];
        foreach ($layers as $layer) {
            if ($remaining <= 0) {
                break;
            }
            $take = min($remaining, (float) $layer->remaining_qty);
            $stock = CurrentStock::query()->where('warehouse_id', $warehouseId)->where('item_id', $itemId)
                ->where('batch_no', $layer->batch_no)->lockForUpdate()->firstOrFail();
            $layer->decrement('remaining_qty', $take);
            $layer->refresh();
            $this->reduceStock($stock, $take);
            $stock->update(['average_cost' => $this->fifoBalanceCost($warehouseId, $itemId, $layer->batch_no)]);
            $this->ledger($stock->fresh(), 'out', $take, (float) $layer->unit_cost, $referenceType, $referenceId, $userId, $stockTransactionId, $layer->id, (float) $layer->remaining_qty);
            $allocations[] = [
                'qty' => $take, 'unit_cost' => (float) $layer->unit_cost, 'batch_no' => $layer->batch_no, 'expired_at' => $layer->expired_at,
                'source_cost_layer_id' => $layer->id, 'source_received_at' => $layer->received_at,
            ];
            $remaining -= $take;
        }
        $this->ensureEnough($remaining);

        return $allocations;
    }

    private function reduceStock(CurrentStock $stock, float $qty): void
    {
        $stock->decrement('qty_on_hand', $qty);
        if ((float) $stock->qty_reserved > 0) {
            $stock->decrement('qty_reserved', min($qty, (float) $stock->qty_reserved));
        }
    }

    private function fifoBalanceCost(int $warehouseId, int $itemId, ?string $batch): float
    {
        return (float) StockCostLayer::query()->where('warehouse_id', $warehouseId)->where('item_id', $itemId)
            ->where('batch_no', $batch)->where('remaining_qty', '>', 0)
            ->selectRaw('COALESCE(SUM(remaining_qty * unit_cost) / NULLIF(SUM(remaining_qty), 0), 0) as cost')
            ->value('cost');
    }

    private function lockSetting(): void
    {
        $setting = InventorySetting::query()->lockForUpdate()->firstOrCreate(
            ['id' => 1], ['valuation_method' => InventoryValuationMethod::MovingAverage],
        );
        if (! $setting->locked_at) {
            $setting->update(['locked_at' => now()]);
        }
    }

    private function ensureEnough(float $remaining): void
    {
        if ($remaining > 0.000001) {
            throw ValidationException::withMessages(['stock' => 'Stok tersedia tidak mencukupi.']);
        }
    }

    private function ledger(CurrentStock $stock, string $direction, float $qty, float $cost, string $referenceType, int $referenceId, int $userId, ?int $stockTransactionId, ?int $stockCostLayerId = null, ?float $costLayerBalanceQty = null): void
    {
        StockLedger::create([
            'stock_transaction_id' => $stockTransactionId, 'reference_type' => $referenceType,
            'stock_cost_layer_id' => $stockCostLayerId,
            'cost_layer_balance_qty' => $costLayerBalanceQty,
            'reference_id' => $referenceId, 'warehouse_id' => $stock->warehouse_id,
            'location_id' => $stock->location_id, 'item_id' => $stock->item_id, 'uom_id' => $stock->uom_id,
            'batch_no' => $stock->batch_no, 'expired_at' => $stock->expired_at, 'direction' => $direction,
            'qty' => $qty, 'unit_cost' => $cost, 'balance_qty' => $stock->qty_on_hand,
            'balance_cost' => $stock->average_cost, 'created_by' => $userId, 'created_at' => now(),
        ]);
    }
}
