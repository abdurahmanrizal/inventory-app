<?php

namespace App\Services;

use App\Models\CurrentStock;
use App\Models\Delivery;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\StockAdjustment;
use App\Models\StockLedger;
use App\Models\StockOpname;
use App\Models\StockReceipt;
use App\Models\StockRequest;
use App\Models\StockReservation;
use App\Models\User;
use App\Models\WorkflowApproval;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryWorkflowService
{
    public function requestApproval(string $module, Model $document, User $creator, array $approverIds): WorkflowApproval
    {
        $steps = collect($approverIds)->filter()->map(function (mixed $step, int $index) {
            if (is_array($step)) {
                return [
                    'approver_id' => $step['approver_id'],
                    'stage_key' => $step['stage_key'] ?? 'level_'.($index + 1),
                    'stage_label' => $step['stage_label'] ?? 'Approval tahap '.($index + 1),
                    'status' => $step['status'] ?? 'pending',
                    'remarks' => $step['remarks'] ?? null,
                    'acted_by' => $step['acted_by'] ?? null,
                    'acted_at' => $step['acted_at'] ?? null,
                ];
            }

            return [
                'approver_id' => $step,
                'stage_key' => 'level_'.($index + 1),
                'stage_label' => 'Approval tahap '.($index + 1),
                'status' => 'pending',
                'remarks' => null,
                'acted_by' => null,
                'acted_at' => null,
            ];
        })->values();

        if ($steps->isEmpty()) {
            throw ValidationException::withMessages(['approver' => 'Approver belum dikonfigurasi untuk dokumen ini.']);
        }

        return DB::transaction(function () use ($module, $document, $creator, $steps) {
            if (WorkflowApproval::where('module', $module)->where('transaction_id', $document->getKey())->exists()) {
                throw ValidationException::withMessages(['approval' => 'Workflow approval untuk dokumen ini sudah pernah dibuat.']);
            }

            $firstPending = $steps->search(fn (array $step) => $step['status'] === 'pending');
            $currentLevel = $firstPending === false ? $steps->count() : $firstPending + 1;
            $approval = WorkflowApproval::create([
                'module' => $module,
                'transaction_id' => $document->getKey(),
                'transaction_no' => $document->number,
                'status' => 'pending',
                'current_level' => $currentLevel,
                'total_levels' => $steps->count(),
                'created_by' => $creator->id,
            ]);
            foreach ($steps as $index => $step) {
                $approval->steps()->create(['level' => $index + 1, ...$step]);
            }
            $document->update(['status' => 'waiting_approval']);

            return $approval->load('steps.approver', 'steps.actor');
        });
    }

    public function act(WorkflowApproval $approval, User $actor, string $action, ?string $remarks = null): void
    {
        DB::transaction(function () use ($approval, $actor, $action, $remarks) {
            $approval = WorkflowApproval::lockForUpdate()->findOrFail($approval->id);
            $step = $approval->steps()->where('level', $approval->current_level)->where('status', 'pending')->first();
            if (! $step || ($step->approver_id !== $actor->id && $actor->role?->value !== 'superadmin')) {
                throw ValidationException::withMessages(['approval' => 'Anda bukan approver aktif untuk tahap ini.']);
            }

            $step->update(['status' => $action, 'remarks' => $remarks, 'acted_by' => $actor->id, 'acted_at' => now()]);
            if ($action === 'rejected') {
                $approval->update(['status' => 'rejected']);
                $document = $this->document($approval);
                $document?->update(['status' => 'rejected']);
                if ($document instanceof StockRequest) {
                    $this->releaseRequestReservations($document);
                }
                if ($document instanceof StockAdjustment && $document->stock_opname_id) {
                    $document->opname()->update(['status' => 'rejected']);
                }

                return;
            }

            if ($approval->module === 'stock_request' && $step->stage_key === 'unit_manager') {
                $this->reserveRequest($this->document($approval)?->load('details'));
            }

            if ($approval->module === 'stock_request' && $step->stage_key === 'warehouse_admin') {
                $request = $this->document($approval)?->load('details');
                $this->prepareRequest($request, $actor);
                $this->releaseRequestReservations($request);
            }

            if ($approval->current_level < $approval->total_levels) {
                $approval->increment('current_level');

                return;
            }

            $approval->update(['status' => 'approved']);
            $document = $this->document($approval);
            $document?->update(['status' => 'approved']);
            match ($approval->module) {
                'goods_receipt' => $this->postGoodsReceipt($document),
                'stock_request' => $this->completePreparedRequest($document),
                'stock_adjustment' => $this->postAdjustment($document),
                default => null,
            };
            if ($document instanceof StockAdjustment && $document->stock_opname_id) {
                $document->opname()->update(['status' => 'approved']);
            }
        });
    }

    public function postGoodsReceipt(GoodsReceipt $receipt): void
    {
        if ($receipt->posted_at) {
            return;
        }
        foreach ($receipt->details as $detail) {
            $this->increase($receipt->warehouse_id, $detail->item_id, (float) $detail->qty_received, (float) $detail->unit_price, $detail->batch_no, $detail->expired_at, $detail->location_id, $detail->uom_id, 'goods_receipt', $receipt->id, $receipt->received_by);
            if ($detail->purchase_order_detail_id) {
                $detail->purchaseOrderDetail()->increment('qty_received', $detail->qty_received);
            }
        }
        $receipt->update(['status' => 'posted', 'posted_at' => now()]);
    }

    public function reserveRequest(StockRequest $request): void
    {
        foreach ($request->details as $detail) {
            $approvedQty = (float) $detail->qty_approved;
            $targetQty = $approvedQty > 0 ? $approvedQty : (float) $detail->qty_requested;
            $alreadyReserved = (float) StockReservation::where('stock_request_detail_id', $detail->id)
                ->where('status', 'active')
                ->sum('qty_reserved');
            $needed = max(0, $targetQty - $alreadyReserved);
            $stocks = CurrentStock::query()->where('warehouse_id', $request->from_warehouse_id)->where('item_id', $detail->item_id)
                ->whereRaw('(qty_on_hand - qty_reserved) > 0')->orderByRaw('expired_at IS NULL, expired_at')->orderBy('created_at')->lockForUpdate()->get();
            foreach ($stocks as $stock) {
                if ($needed <= 0) {
                    break;
                }
                $take = min($needed, (float) $stock->qty_available);
                $stock->increment('qty_reserved', $take);
                StockReservation::create(['stock_request_detail_id' => $detail->id, 'warehouse_id' => $request->from_warehouse_id, 'item_id' => $detail->item_id, 'batch_no' => $stock->batch_no, 'qty_reserved' => $take, 'status' => 'active']);
                $needed -= $take;
            }
            if ($needed > 0) {
                throw ValidationException::withMessages(['stock' => "Stok {$detail->item_id} tidak mencukupi untuk reservasi."]);
            }
            $detail->update(['qty_approved' => $detail->qty_requested]);
        }
    }

    private function releaseRequestReservations(StockRequest $request): void
    {
        $reservations = StockReservation::query()
            ->whereIn('stock_request_detail_id', $request->details()->select('id'))
            ->where('status', 'active')
            ->lockForUpdate()
            ->get();

        foreach ($reservations as $reservation) {
            $stock = CurrentStock::query()
                ->where('warehouse_id', $reservation->warehouse_id)
                ->where('item_id', $reservation->item_id)
                ->where('batch_no', $reservation->batch_no)
                ->lockForUpdate()
                ->first();

            if ($stock) {
                $stock->decrement('qty_reserved', min(
                    (float) $stock->qty_reserved,
                    (float) $reservation->qty_reserved,
                ));
            }

            $reservation->update(['status' => 'released']);
        }
    }

    private function prepareRequest(StockRequest $request, User $admin): void
    {
        DB::transaction(function () use ($request, $admin) {
            $approval = WorkflowApproval::where('module', 'stock_request')->where('transaction_id', $request->id)->lockForUpdate()->firstOrFail();
            $activeStep = $approval->steps()->where('level', $approval->current_level)->first();
            abort_unless(
                $activeStep?->stage_key === 'warehouse_admin'
                && ($activeStep->approver_id === $admin->id || $admin->role?->value === 'superadmin')
                && $approval->steps()->where('stage_key', 'unit_manager')->where('status', 'approved')->exists(),
                422,
                'Request belum berada pada tahap approval admin gudang.',
            );
            abort_if($request->prepared_at, 422, 'Barang untuk request ini sudah disiapkan.');

            $delivery = Delivery::create(['number' => 'DO-'.now()->format('YmdHis').'-'.$request->id, 'stock_request_id' => $request->id, 'delivery_date' => now(), 'status' => 'draft', 'notes' => 'Disiapkan untuk '.$request->number, 'delivered_by' => $admin->id]);
            foreach ($request->details as $detail) {
                $detail->update(['qty_approved' => $detail->qty_requested]);
                $delivery->details()->create(['stock_request_detail_id' => $detail->id, 'item_id' => $detail->item_id, 'uom_id' => $detail->uom_id, 'qty_delivered' => $detail->qty_approved, 'batch_no' => $detail->batch_no]);
            }
            $request->update(['prepared_by' => $admin->id, 'prepared_at' => now(), 'status' => 'waiting_approval']);
        });
    }

    public function completePreparedRequest(StockRequest $request): void
    {
        abort_unless($request->prepared_at, 422, 'Barang belum disiapkan oleh admin gudang.');
        // Menjamin request lama/in-flight yang belum memiliki reservasi tetap aman
        // sebelum approval final memindahkan stok.
        $this->reserveRequest($request->loadMissing('details'));
        $delivery = $request->deliveries()->where('status', 'draft')->with('details')->firstOrFail();
        $this->ship($delivery);
        $receipt = StockReceipt::create(['number' => 'RCV-'.now()->format('YmdHis').'-'.$request->id, 'delivery_id' => $delivery->id, 'receipt_date' => now(), 'status' => 'received', 'notes' => 'Penerimaan otomatis setelah approval manajer gudang.', 'received_by' => $request->requested_by]);
        foreach ($delivery->details as $detail) {
            $receipt->details()->create(['delivery_detail_id' => $detail->id, 'item_id' => $detail->item_id, 'uom_id' => $detail->uom_id, 'qty_received' => $detail->qty_delivered, 'batch_no' => $detail->batch_no]);
        }
        $this->receive($receipt->load('details'));
    }

    public function ship(Delivery $delivery): void
    {
        DB::transaction(function () use ($delivery) {
            $request = $delivery->stockRequest()->firstOrFail();
            foreach ($delivery->details as $detail) {
                $this->decrease($request->from_warehouse_id, $detail->item_id, (float) $detail->qty_delivered, $detail->batch_no, 'delivery', $delivery->id, $delivery->delivered_by);
                $detail->requestDetail()->increment('qty_delivered', $detail->qty_delivered);
                StockReservation::where('stock_request_detail_id', $detail->stock_request_detail_id)->where('status', 'active')->update(['status' => 'consumed']);
            }
            $delivery->update(['status' => 'shipped']);
            $request->update(['status' => 'delivering']);
        });
    }

    public function receive(StockReceipt $receipt): void
    {
        DB::transaction(function () use ($receipt) {
            $delivery = $receipt->delivery()->with('stockRequest')->firstOrFail();
            foreach ($receipt->details as $detail) {
                $source = $detail->deliveryDetail()->firstOrFail();
                $outgoingLedger = StockLedger::query()
                    ->where('reference_type', 'delivery')
                    ->where('reference_id', $delivery->id)
                    ->where('warehouse_id', $delivery->stockRequest->from_warehouse_id)
                    ->where('item_id', $detail->item_id)
                    ->when($detail->batch_no, fn ($query) => $query->where('batch_no', $detail->batch_no))
                    ->where('direction', 'out')
                    ->get(['qty', 'unit_cost']);
                $totalIssuedQty = (float) $outgoingLedger->sum('qty');
                abort_unless($totalIssuedQty > 0, 422, 'HPP stok gudang utama tidak ditemukan.');
                $sourceCost = $outgoingLedger->sum(fn (StockLedger $ledger) => (float) $ledger->qty * (float) $ledger->unit_cost) / $totalIssuedQty;
                $this->increase($delivery->stockRequest->to_warehouse_id, $detail->item_id, (float) $detail->qty_received, $sourceCost, $detail->batch_no, null, $detail->location_id, $detail->uom_id, 'receipt', $receipt->id, $receipt->received_by, true);
                $source->requestDetail()->increment('qty_received', $detail->qty_received);
            }
            $delivery->update(['status' => 'received']);
            $delivery->stockRequest->update(['status' => 'received']);
        });
    }

    public function postAdjustment(StockAdjustment $adjustment): void
    {
        if ($adjustment->posted_at) {
            return;
        }
        foreach ($adjustment->details as $detail) {
            $qty = (float) $detail->qty_adjustment;
            if ($qty >= 0) {
                $cost = (float) CurrentStock::where('warehouse_id', $adjustment->warehouse_id)
                    ->where('item_id', $detail->item_id)
                    ->where('qty_on_hand', '>', 0)
                    ->selectRaw('SUM(qty_on_hand * average_cost) / SUM(qty_on_hand) as weighted_cost')
                    ->value('weighted_cost');
                $this->increase($adjustment->warehouse_id, $detail->item_id, $qty, $cost, $detail->batch_no, null, $detail->location_id, $detail->uom_id, 'adjustment', $adjustment->id, $adjustment->created_by);
            } else {
                $this->decrease($adjustment->warehouse_id, $detail->item_id, abs($qty), $detail->batch_no, 'adjustment', $adjustment->id, $adjustment->created_by);
            }
        }
        $adjustment->update(['status' => 'posted', 'posted_at' => now()]);
    }

    private function document(WorkflowApproval $approval): ?Model
    {
        return match ($approval->module) {
            'purchase_order' => PurchaseOrder::find($approval->transaction_id),
            'goods_receipt' => GoodsReceipt::find($approval->transaction_id),
            'stock_request' => StockRequest::find($approval->transaction_id),
            'stock_adjustment' => StockAdjustment::find($approval->transaction_id),
            'stock_opname' => StockOpname::find($approval->transaction_id),
            default => null,
        };
    }

    private function increase(int $warehouseId, int $itemId, float $qty, float $cost, ?string $batch, mixed $expired, ?int $locationId, ?int $uomId, string $reference, int $referenceId, int $userId, bool $followSourceCost = false): void
    {
        $stock = CurrentStock::firstOrCreate(['warehouse_id' => $warehouseId, 'item_id' => $itemId, 'batch_no' => $batch], ['location_id' => $locationId, 'uom_id' => $uomId, 'expired_at' => $expired, 'qty_on_hand' => 0, 'qty_reserved' => 0, 'average_cost' => 0]);
        $oldQty = (float) $stock->qty_on_hand;
        $newQty = $oldQty + $qty;
        $newCost = $followSourceCost
            ? $cost
            : ($newQty > 0 ? (($oldQty * (float) $stock->average_cost) + ($qty * $cost)) / $newQty : 0);
        $stock->update(['qty_on_hand' => $newQty, 'average_cost' => $newCost, 'location_id' => $locationId ?? $stock->location_id, 'uom_id' => $uomId ?? $stock->uom_id]);
        $this->ledger($stock, 'in', $qty, $cost, $reference, $referenceId, $userId);
    }

    private function decrease(int $warehouseId, int $itemId, float $qty, ?string $batch, string $reference, int $referenceId, int $userId): void
    {
        $stocks = CurrentStock::where('warehouse_id', $warehouseId)->where('item_id', $itemId)->when($batch, fn ($q) => $q->where('batch_no', $batch))->where('qty_on_hand', '>', 0)->orderByRaw('expired_at IS NULL, expired_at')->orderBy('created_at')->lockForUpdate()->get();
        $remaining = $qty;
        foreach ($stocks as $stock) {
            if ($remaining <= 0) {
                break;
            }
            $take = min($remaining, (float) $stock->qty_on_hand);
            $stock->decrement('qty_on_hand', $take);
            if ((float) $stock->qty_reserved > 0) {
                $stock->decrement('qty_reserved', min($take, (float) $stock->qty_reserved));
            }
            $stock->refresh();
            $this->ledger($stock, 'out', $take, (float) $stock->average_cost, $reference, $referenceId, $userId);
            $remaining -= $take;
        }
        if ($remaining > 0) {
            throw ValidationException::withMessages(['stock' => 'Stok tersedia tidak mencukupi.']);
        }
    }

    private function ledger(CurrentStock $stock, string $direction, float $qty, float $cost, string $reference, int $referenceId, int $userId): void
    {
        StockLedger::create(['reference_type' => $reference, 'reference_id' => $referenceId, 'warehouse_id' => $stock->warehouse_id, 'location_id' => $stock->location_id, 'item_id' => $stock->item_id, 'uom_id' => $stock->uom_id, 'batch_no' => $stock->batch_no, 'expired_at' => $stock->expired_at, 'direction' => $direction, 'qty' => $qty, 'unit_cost' => $cost, 'balance_qty' => $stock->qty_on_hand, 'balance_cost' => $stock->average_cost, 'created_by' => $userId, 'created_at' => now()]);
    }
}
