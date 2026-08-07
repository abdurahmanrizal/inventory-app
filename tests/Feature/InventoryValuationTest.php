<?php

namespace Tests\Feature;

use App\Enums\InventoryValuationMethod;
use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Delivery;
use App\Models\InventorySetting;
use App\Models\Item;
use App\Models\StockAdjustment;
use App\Models\StockCostLayer;
use App\Models\StockLedger;
use App\Models\StockReceipt;
use App\Models\StockRequest;
use App\Models\StockTransferLayerAllocation;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\InventoryReportService;
use App\Services\InventoryValuationService;
use App\Services\InventoryWorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class InventoryValuationTest extends TestCase
{
    use RefreshDatabase;

    public function test_fifo_issues_the_oldest_cost_layer_first(): void
    {
        $warehouse = Warehouse::create(['code' => 'FIFO-WH', 'name' => 'FIFO Warehouse', 'type' => 'main']);
        $item = Item::create(['code' => 'FIFO-ITEM', 'name' => 'FIFO Item', 'base_uom' => 'PCS']);
        $user = User::factory()->create(['role' => UserRole::Superadmin]);
        InventorySetting::current()->update(['valuation_method' => InventoryValuationMethod::Fifo]);
        $service = app(InventoryValuationService::class);

        $service->receive($warehouse->id, $item->id, 10, 100, null, null, null, null, 'test_receipt', 1, $user->id);
        $service->receive($warehouse->id, $item->id, 10, 200, null, null, null, null, 'test_receipt', 2, $user->id);
        $allocations = $service->issue($warehouse->id, $item->id, 12, null, 'test_issue', 3, $user->id);

        $this->assertSame([
            ['qty' => 10.0, 'unit_cost' => 100.0],
            ['qty' => 2.0, 'unit_cost' => 200.0],
        ], collect($allocations)->map(fn (array $allocation) => [
            'qty' => $allocation['qty'],
            'unit_cost' => $allocation['unit_cost'],
        ])->all());
        $this->assertSame([0.0, 8.0], StockCostLayer::orderBy('id')->get()->map(fn ($layer) => (float) $layer->remaining_qty)->all());
        $this->assertSame([100.0, 200.0], StockLedger::where('direction', 'out')->orderBy('id')->get()->map(fn ($ledger) => (float) $ledger->unit_cost)->all());
    }

    public function test_fifo_adjustment_uses_entered_inbound_cost_and_snapshots_actual_outbound_cost(): void
    {
        $warehouse = Warehouse::create(['code' => 'FIFO-ADJ', 'name' => 'FIFO Adjustment', 'type' => 'main']);
        $item = Item::create(['code' => 'FIFO-ADJ-ITEM', 'name' => 'FIFO Adjustment Item', 'base_uom' => 'PCS']);
        $user = User::factory()->create(['role' => UserRole::Superadmin]);
        InventorySetting::current()->update(['valuation_method' => InventoryValuationMethod::Fifo]);
        $valuation = app(InventoryValuationService::class);
        $valuation->receive($warehouse->id, $item->id, 10, 100, null, null, null, null, 'test_receipt', 1, $user->id);

        $increase = StockAdjustment::create([
            'number' => 'ADJ-FIFO-IN', 'type' => 'correction', 'valuation_method' => InventoryValuationMethod::Fifo,
            'warehouse_id' => $warehouse->id, 'adjustment_date' => now(), 'reason' => 'Surplus', 'created_by' => $user->id,
        ]);
        $increase->details()->create(['item_id' => $item->id, 'qty_adjustment' => 5, 'unit_price' => 200]);
        app(InventoryWorkflowService::class)->postAdjustment($increase->load('details'));

        $decrease = StockAdjustment::create([
            'number' => 'ADJ-FIFO-OUT', 'type' => 'correction', 'valuation_method' => InventoryValuationMethod::Fifo,
            'warehouse_id' => $warehouse->id, 'adjustment_date' => now(), 'reason' => 'Shortage', 'created_by' => $user->id,
        ]);
        $decrease->details()->create(['item_id' => $item->id, 'qty_adjustment' => -12]);
        app(InventoryWorkflowService::class)->postAdjustment($decrease->load('details'));

        $this->assertSame([0.0, 3.0], StockCostLayer::orderBy('id')->get()->map(fn ($layer) => (float) $layer->remaining_qty)->all());
        $this->assertSame(116.67, (float) $decrease->details()->firstOrFail()->unit_price);
        $this->assertSame(3.0, (float) CurrentStock::firstOrFail()->qty_on_hand);
        $this->assertSame(200.0, (float) CurrentStock::firstOrFail()->average_cost);
    }

    public function test_method_can_be_selected_before_posting_and_is_locked_afterward(): void
    {
        $warehouse = Warehouse::create(['code' => 'LOCK-WH', 'name' => 'Lock Warehouse', 'type' => 'main']);
        $item = Item::create(['code' => 'LOCK-ITEM', 'name' => 'Lock Item', 'base_uom' => 'PCS']);
        $user = User::factory()->create(['role' => UserRole::Superadmin]);

        $this->actingAs($user)->put('/settings/inventory-valuation', ['valuation_method' => 'fifo'])->assertRedirect();
        $this->assertSame(InventoryValuationMethod::Fifo, InventorySetting::current()->valuation_method);

        app(InventoryValuationService::class)->receive($warehouse->id, $item->id, 1, 100, null, null, null, null, 'test_receipt', 1, $user->id);

        $this->actingAs($user)->put('/settings/inventory-valuation', ['valuation_method' => 'moving_average'])
            ->assertSessionHasErrors('valuation_method');
        $this->assertSame(InventoryValuationMethod::Fifo, InventorySetting::current()->valuation_method);
    }

    public function test_non_superadmin_cannot_view_or_change_inventory_valuation(): void
    {
        $user = User::factory()->create(['role' => UserRole::WarehouseAdminDry]);

        $this->actingAs($user)->get('/settings/inventory-valuation')->assertForbidden();
        $this->actingAs($user)->put('/settings/inventory-valuation', [
            'valuation_method' => 'fifo',
        ])->assertForbidden();

        $this->assertSame(InventoryValuationMethod::MovingAverage, InventorySetting::current()->valuation_method);
    }

    public function test_warehouse_stock_exposes_fifo_layers_and_exact_remaining_value(): void
    {
        $warehouse = Warehouse::create(['code' => 'VIEW-WH', 'name' => 'View Warehouse', 'type' => 'main']);
        $item = Item::create(['code' => 'VIEW-ITEM', 'name' => 'View Item', 'base_uom' => 'PCS']);
        $user = User::factory()->create(['role' => UserRole::Superadmin]);
        InventorySetting::current()->update(['valuation_method' => InventoryValuationMethod::Fifo]);
        $service = app(InventoryValuationService::class);
        $service->receive($warehouse->id, $item->id, 3, 100, 'B-1', null, null, null, 'test_receipt', 1, $user->id);
        $service->receive($warehouse->id, $item->id, 2, 250, 'B-1', null, null, null, 'test_receipt', 2, $user->id);

        $this->actingAs($user)->get('/warehouse-stocks')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('valuationMethod', 'fifo')
            ->has('stocks', 1)
            ->has('stocks.0.cost_layers', 2)
            ->where('stocks.0.stock_value', 800)
            ->where('summary.value', 800));
    }

    public function test_fifo_financial_reports_reconcile_to_remaining_layers(): void
    {
        [$warehouse, $item, $user] = $this->valuationFixtures('FIN-FIFO');
        InventorySetting::current()->update(['valuation_method' => InventoryValuationMethod::Fifo]);
        $valuation = app(InventoryValuationService::class);
        $valuation->receive($warehouse->id, $item->id, 10, 100, null, null, null, null, 'test_receipt', 1, $user->id);
        $valuation->receive($warehouse->id, $item->id, 10, 200, null, null, null, null, 'test_receipt', 2, $user->id);
        $valuation->issue($warehouse->id, $item->id, 12, null, 'test_issue', 3, $user->id);

        $reports = app(InventoryReportService::class);
        $filters = ['date_from' => now()->format('Y-m-d'), 'date_to' => now()->format('Y-m-d')];
        $movement = $reports->financialMovement(collect([$warehouse->id]), $warehouse->id, $filters);
        $audit = $reports->valuationAudit(collect([$warehouse->id]), $warehouse->id, $filters);
        $anomalies = $reports->anomalies(collect([$warehouse->id]), $warehouse->id);
        $costHistory = $reports->costHistory(collect([$warehouse->id]), $warehouse->id, $filters);

        $this->assertSame(3000.0, $movement['summary']['incomingValue']);
        $this->assertSame(1400.0, $movement['summary']['outgoingValue']);
        $this->assertSame(1600.0, $movement['summary']['closingValue']);
        $this->assertSame(1600.0, $movement['summary']['operationalValue']);
        $this->assertSame(0.0, $movement['summary']['difference']);
        $this->assertSame(8.0, (float) $audit['summary']['qty']);
        $this->assertSame(1600.0, $audit['summary']['value']);
        $this->assertSame(0, $anomalies['summary']['issues']);
        $this->assertSame('fifo', $costHistory['method']);
        $this->assertSame([100.0, 200.0], $costHistory['rows']->pluck('unit_cost')->all());
        $this->assertSame([10.0, 2.0], $costHistory['rows']->pluck('consumed_qty')->all());
        $this->assertSame([0.0, 8.0], $costHistory['rows']->pluck('layer_balance_qty')->all());
        $this->assertNotNull($costHistory['rows']->first()['layer_received_at']);
    }

    public function test_moving_average_financial_reports_use_posted_average_cost(): void
    {
        [$warehouse, $item, $user] = $this->valuationFixtures('FIN-AVG');
        $valuation = app(InventoryValuationService::class);
        $valuation->receive($warehouse->id, $item->id, 10, 100, null, null, null, null, 'test_receipt', 1, $user->id);
        $valuation->receive($warehouse->id, $item->id, 10, 200, null, null, null, null, 'test_receipt', 2, $user->id);
        $valuation->issue($warehouse->id, $item->id, 12, null, 'test_issue', 3, $user->id);

        $filters = ['date_from' => now()->format('Y-m-d'), 'date_to' => now()->format('Y-m-d')];
        $movement = app(InventoryReportService::class)->financialMovement(collect([$warehouse->id]), $warehouse->id, $filters);

        $this->assertSame(1800.0, $movement['summary']['outgoingValue']);
        $this->assertSame(1200.0, $movement['summary']['closingValue']);
        $this->assertSame(1200.0, $movement['summary']['operationalValue']);
        $this->assertSame(0.0, $movement['summary']['difference']);
    }

    public function test_fifo_transfer_to_unit_preserves_each_source_cost_layer(): void
    {
        $main = Warehouse::create(['code' => 'FIFO-MAIN', 'name' => 'FIFO Main', 'type' => 'main']);
        $unit = Warehouse::create(['code' => 'FIFO-UNIT', 'name' => 'FIFO Unit', 'type' => 'unit', 'main_warehouse_id' => $main->id]);
        $item = Item::create(['code' => 'FIFO-TRANSFER', 'name' => 'FIFO Transfer', 'base_uom' => 'PCS']);
        $user = User::factory()->create(['role' => UserRole::Superadmin]);
        InventorySetting::current()->update(['valuation_method' => InventoryValuationMethod::Fifo]);
        $valuation = app(InventoryValuationService::class);
        $valuation->receive($main->id, $item->id, 10, 100, null, null, null, null, 'goods_receipt', 1, $user->id, null, false, now()->subDays(10));
        $valuation->receive($main->id, $item->id, 10, 200, null, null, null, null, 'goods_receipt', 2, $user->id, null, false, now()->subDays(5));
        $sourceLayers = StockCostLayer::where('warehouse_id', $main->id)->orderBy('id')->get();

        $request = StockRequest::create([
            'number' => 'REQ-FIFO-TRANSFER', 'from_warehouse_id' => $main->id, 'to_warehouse_id' => $unit->id,
            'request_date' => now(), 'status' => 'approved', 'requested_by' => $user->id,
        ]);
        $requestDetail = $request->details()->create(['item_id' => $item->id, 'qty_requested' => 12, 'qty_approved' => 12]);
        $delivery = Delivery::create([
            'number' => 'DO-FIFO-TRANSFER', 'stock_request_id' => $request->id, 'delivery_date' => now(),
            'status' => 'draft', 'delivered_by' => $user->id,
        ]);
        $deliveryDetail = $delivery->details()->create([
            'stock_request_detail_id' => $requestDetail->id, 'item_id' => $item->id, 'qty_delivered' => 12,
        ]);

        $workflow = app(InventoryWorkflowService::class);
        $workflow->ship($delivery->load('details'));
        $receipt = StockReceipt::create([
            'number' => 'RCV-FIFO-TRANSFER', 'delivery_id' => $delivery->id, 'receipt_date' => now(),
            'status' => 'received', 'received_by' => $user->id,
        ]);
        $receipt->details()->create([
            'delivery_detail_id' => $deliveryDetail->id, 'item_id' => $item->id, 'qty_received' => 12,
        ]);
        $workflow->receive($receipt->load('details'));

        $allocations = StockTransferLayerAllocation::orderBy('id')->get();
        $destinationLayers = StockCostLayer::where('warehouse_id', $unit->id)->orderBy('id')->get();
        $this->assertSame([10.0, 2.0], $allocations->map(fn ($row) => (float) $row->qty_allocated)->all());
        $this->assertSame([10.0, 2.0], $allocations->map(fn ($row) => (float) $row->qty_received)->all());
        $this->assertSame([10.0, 2.0], $destinationLayers->map(fn ($row) => (float) $row->original_qty)->all());
        $this->assertSame([100.0, 200.0], $destinationLayers->map(fn ($row) => (float) $row->unit_cost)->all());
        $this->assertSame($sourceLayers->pluck('id')->all(), $destinationLayers->pluck('source_cost_layer_id')->all());
        $this->assertSame(
            $sourceLayers->map(fn ($row) => $row->received_at->format('Y-m-d H:i:s'))->all(),
            $destinationLayers->map(fn ($row) => $row->received_at->format('Y-m-d H:i:s'))->all(),
        );
    }

    private function valuationFixtures(string $prefix): array
    {
        $warehouse = Warehouse::create(['code' => $prefix.'-WH', 'name' => $prefix.' Warehouse', 'type' => 'main']);
        $item = Item::create(['code' => $prefix.'-ITEM', 'name' => $prefix.' Item', 'base_uom' => 'PCS']);
        $user = User::factory()->create(['role' => UserRole::Superadmin]);

        return [$warehouse, $item, $user];
    }
}
