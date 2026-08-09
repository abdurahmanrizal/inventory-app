<?php

namespace App\Services;

use App\Enums\InventoryValuationMethod;
use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Delivery;
use App\Models\GoodsReceipt;
use App\Models\PurchaseOrder;
use App\Models\StockAdjustment;
use App\Models\StockOpname;
use App\Models\StockReceipt;
use App\Models\StockRequest;
use App\Models\StockReservation;
use App\Models\StockTransferLayerAllocation;
use App\Models\User;
use App\Models\WorkflowApproval;
use App\Models\WorkflowApprovalStep;
use App\Notifications\StockRequestWorkflowNotification;
use App\Support\ApproverResolver;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class InventoryWorkflowService
{
    public function __construct(private readonly InventoryValuationService $valuation) {}

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

        $approval = DB::transaction(function () use ($module, $document, $creator, $steps) {
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

        $this->scheduleApprovalRequired(
            $approval,
            $approval->steps->firstWhere('level', $approval->current_level),
        );

        return $approval;
    }

    public function act(WorkflowApproval $approval, User $actor, string $action, ?string $remarks = null): void
    {
        DB::transaction(function () use ($approval, $actor, $action, $remarks) {
            $approval = WorkflowApproval::lockForUpdate()->findOrFail($approval->id);
            $step = $approval->steps()->where('level', $approval->current_level)->where('status', 'pending')->first();
            $canRepresent = $step && ApproverResolver::canRepresentMainWarehouseApprover($actor, $step->approver_id);
            if (! $step || ($step->approver_id !== $actor->id && $actor->role?->value !== 'superadmin' && ! $canRepresent)) {
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

                $this->scheduleCreatorUpdate($approval, 'request_rejected', $actor, $step);

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
                $nextLevel = $approval->current_level + 1;
                $approval->increment('current_level');
                $this->scheduleApprovalRequired(
                    $approval,
                    $approval->steps()->where('level', $nextLevel)->first(),
                    $actor,
                );

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
            $this->scheduleCreatorUpdate($approval, 'request_fully_approved', $actor, $step);
        });
    }

    private function scheduleApprovalRequired(WorkflowApproval $approval, ?WorkflowApprovalStep $step, ?User $actor = null): void
    {
        if ($approval->module !== 'stock_request' || ! $step?->approver_id) {
            return;
        }

        $recipientId = $step->approver_id;
        $request = StockRequest::with('fromWarehouse.mainWarehouse')->find($approval->transaction_id);
        $mainWarehouse = $request?->fromWarehouse?->type === 'main'
            ? $request->fromWarehouse
            : $request?->fromWarehouse?->mainWarehouse;
        $notification = new StockRequestWorkflowNotification(
            event: 'approval_required',
            workflowApprovalId: $approval->id,
            transactionId: $approval->transaction_id,
            transactionNo: $approval->transaction_no,
            title: 'Request stok menunggu persetujuan',
            message: $approval->transaction_no.' memerlukan persetujuan Anda pada tahap '.$step->stage_label.'.',
            actionUrl: '/approvals',
            stageKey: $step->stage_key,
            stageLabel: $step->stage_label,
            actorName: $actor?->name,
            mainWarehouseId: $mainWarehouse?->id,
            mainWarehouseName: $mainWarehouse?->name,
        );

        $recipientIds = collect([$recipientId]);
        if ($step->stage_key === 'warehouse_manager' && $mainWarehouse) {
            $recipientIds = $recipientIds->merge(
                User::query()->where('role', UserRole::WarehouseManager)->pluck('id'),
            );
        }
        $recipientIds = $recipientIds->unique()->values();
        DB::afterCommit(fn () => $recipientIds->each(
            fn (int $id) => User::find($id)?->notify($notification),
        ));
    }

    private function scheduleCreatorUpdate(WorkflowApproval $approval, string $event, User $actor, WorkflowApprovalStep $step): void
    {
        if ($approval->module !== 'stock_request') {
            return;
        }

        $recipientId = $approval->created_by;
        $approved = $event === 'request_fully_approved';
        $notification = new StockRequestWorkflowNotification(
            event: $event,
            workflowApprovalId: $approval->id,
            transactionId: $approval->transaction_id,
            transactionNo: $approval->transaction_no,
            title: $approved ? 'Request stok disetujui' : 'Request stok ditolak',
            message: $approved
                ? $approval->transaction_no.' telah disetujui seluruh tahap approval.'
                : $approval->transaction_no.' ditolak oleh '.$actor->name.' pada tahap '.$step->stage_label.'.',
            actionUrl: '/stock-requests?search='.urlencode($approval->transaction_no),
            stageKey: $step->stage_key,
            stageLabel: $step->stage_label,
            actorName: $actor->name,
        );

        DB::afterCommit(fn () => User::find($recipientId)?->notify($notification));
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
                $allocations = $this->decrease($request->from_warehouse_id, $detail->item_id, (float) $detail->qty_delivered, $detail->batch_no, 'delivery', $delivery->id, $delivery->delivered_by);
                foreach ($allocations as $allocation) {
                    StockTransferLayerAllocation::create([
                        'delivery_detail_id' => $detail->id,
                        'source_cost_layer_id' => $allocation['source_cost_layer_id'],
                        'batch_no' => $allocation['batch_no'],
                        'expired_at' => $allocation['expired_at'],
                        'source_received_at' => $allocation['source_received_at'],
                        'qty_allocated' => $allocation['qty'],
                        'unit_cost' => $allocation['unit_cost'],
                    ]);
                }
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
                $allocations = StockTransferLayerAllocation::query()
                    ->where('delivery_detail_id', $source->id)
                    ->whereColumn('qty_received', '<', 'qty_allocated')
                    ->orderBy('id')->lockForUpdate()->get();
                abort_if($allocations->isEmpty(), 422, 'Alokasi biaya pengiriman tidak ditemukan.');
                $remaining = (float) $detail->qty_received;
                $available = $allocations->sum(fn (StockTransferLayerAllocation $allocation) => (float) $allocation->qty_allocated - (float) $allocation->qty_received);
                abort_if($available + 0.000001 < $remaining, 422, 'Kuantitas penerimaan melebihi alokasi biaya pengiriman.');

                if ($this->valuation->method() === InventoryValuationMethod::Fifo) {
                    foreach ($allocations as $allocation) {
                        if ($remaining <= 0) {
                            break;
                        }
                        $availableQty = (float) $allocation->qty_allocated - (float) $allocation->qty_received;
                        $take = min($remaining, $availableQty);
                        $this->valuation->receive(
                            $delivery->stockRequest->to_warehouse_id, $detail->item_id, $take, (float) $allocation->unit_cost,
                            $allocation->batch_no, $allocation->expired_at, $detail->location_id, $detail->uom_id,
                            'receipt', $receipt->id, $receipt->received_by, null, false,
                            $allocation->source_received_at, $allocation->source_cost_layer_id,
                        );
                        $allocation->increment('qty_received', $take);
                        $remaining -= $take;
                    }
                } else {
                    $receivedQty = $remaining;
                    $receivedValue = 0.0;
                    foreach ($allocations as $allocation) {
                        if ($remaining <= 0) {
                            break;
                        }
                        $take = min($remaining, (float) $allocation->qty_allocated - (float) $allocation->qty_received);
                        $receivedValue += $take * (float) $allocation->unit_cost;
                        $allocation->increment('qty_received', $take);
                        $remaining -= $take;
                    }
                    $sourceCost = $receivedValue / $receivedQty;
                    $this->increase($delivery->stockRequest->to_warehouse_id, $detail->item_id, $receivedQty, $sourceCost, $detail->batch_no, null, $detail->location_id, $detail->uom_id, 'receipt', $receipt->id, $receipt->received_by, true);
                }
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
        if ($adjustment->valuation_method !== $this->valuation->method()) {
            throw ValidationException::withMessages([
                'valuation_method' => 'Metode valuasi dokumen berbeda dengan metode persediaan yang aktif.',
            ]);
        }
        foreach ($adjustment->details as $detail) {
            $qty = (float) $detail->qty_adjustment;
            if (abs($qty) < 0.000001) {
                continue;
            }
            if ($qty > 0) {
                $cost = (float) $detail->unit_price;
                if ($cost <= 0) {
                    throw ValidationException::withMessages([
                        'unit_price' => 'Biaya unit wajib lebih dari nol untuk penambahan stok.',
                    ]);
                }
                $this->increase($adjustment->warehouse_id, $detail->item_id, $qty, $cost, $detail->batch_no, null, $detail->location_id, $detail->uom_id, 'adjustment', $adjustment->id, $adjustment->created_by);
            } else {
                $allocations = $this->decrease($adjustment->warehouse_id, $detail->item_id, abs($qty), $detail->batch_no, 'adjustment', $adjustment->id, $adjustment->created_by);
                $actualCost = collect($allocations)->sum(fn (array $allocation) => $allocation['qty'] * $allocation['unit_cost']) / abs($qty);
                $detail->update(['unit_price' => $actualCost]);
            }
        }
        $adjustment->update(['status' => 'posted', 'posted_at' => now()]);
    }

    public function currentAdjustmentCost(int $warehouseId, int $itemId, ?string $batch = null): float
    {
        return $this->valuation->currentInboundCost($warehouseId, $itemId, $batch);
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
        $this->valuation->receive(
            $warehouseId, $itemId, $qty, $cost, $batch, $expired,
            $locationId, $uomId, $reference, $referenceId, $userId,
            null, $followSourceCost,
        );
    }

    private function decrease(int $warehouseId, int $itemId, float $qty, ?string $batch, string $reference, int $referenceId, int $userId): array
    {
        return $this->valuation->issue($warehouseId, $itemId, $qty, $batch, $reference, $referenceId, $userId);
    }
}
