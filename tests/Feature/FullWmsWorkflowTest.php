<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\GoodsReceipt;
use App\Models\GoodsReceiptDetail;
use App\Models\Item;
use App\Models\Location;
use App\Models\StockAdjustment;
use App\Models\StockOpname;
use App\Models\StockRequest;
use App\Models\Supplier;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkflowApproval;
use App\Services\InventoryWorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FullWmsWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_approved_goods_receipt_posts_stock_and_ledger(): void
    {
        $warehouse = Warehouse::create(['code' => 'WH-T', 'name' => 'Test', 'type' => 'main']);
        $supplier = Supplier::create(['code' => 'SUP-T', 'name' => 'Supplier Test']);
        $item = Item::create(['code' => 'ITEM-T', 'name' => 'Item Test', 'base_uom' => 'PCS']);
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        $receipt = GoodsReceipt::create(['number' => 'GRN-T', 'supplier_id' => $supplier->id, 'warehouse_id' => $warehouse->id, 'receipt_date' => now(), 'received_by' => $admin->id, 'assigned_approver_id' => $manager->id]);
        GoodsReceiptDetail::create(['goods_receipt_id' => $receipt->id, 'item_id' => $item->id, 'qty_received' => 10, 'unit_price' => 2500, 'batch_no' => 'B-1']);

        $service = app(InventoryWorkflowService::class);
        $approval = $service->requestApproval('goods_receipt', $receipt, $admin, [$manager->id]);
        $service->act($approval, $manager, 'approved');

        $this->assertSame('posted', $receipt->fresh()->status);
        $this->assertSame(10.0, (float) CurrentStock::first()->qty_on_hand);
        $this->assertSame(2500.0, (float) CurrentStock::first()->average_cost);
        $this->assertDatabaseHas('stock_ledgers', ['reference_type' => 'goods_receipt', 'direction' => 'in']);
    }

    public function test_unit_user_cannot_open_master_data_but_can_open_fulfillment(): void
    {
        $user = User::factory()->create(['role' => UserRole::UnitUser]);
        $this->actingAs($user)->get('/operations/master-data')->assertForbidden();
        $this->actingAs($user)->get('/operations/fulfillment')->assertOk();
    }

    public function test_master_data_page_loads_seeded_warehouse_locations(): void
    {
        $warehouse = Warehouse::create(['code' => 'WH-M', 'name' => 'Master Warehouse', 'type' => 'main']);
        Location::create(['warehouse_id' => $warehouse->id, 'code' => 'ZONE-A', 'name' => 'Zona A', 'type' => 'zone']);
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);

        $this->actingAs($admin)->get('/operations/master-data')->assertOk();
    }

    public function test_warehouse_admin_cannot_access_or_create_master_data(): void
    {
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry]);

        $this->actingAs($admin)->get('/operations/master-data')->assertForbidden();
        $this->actingAs($admin)->post('/operations/master-data/suppliers', [
            'code' => 'NO-ACCESS', 'name' => 'Tidak Boleh Dibuat',
        ])->assertForbidden();
        $this->assertDatabaseMissing('suppliers', ['code' => 'NO-ACCESS']);
    }

    public function test_superadmin_can_edit_master_supplier(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        $supplier = Supplier::create(['code' => 'SUP-OLD', 'name' => 'Nama Lama']);

        $this->actingAs($admin)->put("/operations/master-data/suppliers/{$supplier->id}", [
            'code' => 'SUP-NEW', 'name' => 'Nama Baru', 'phone' => '0812345', 'is_active' => true,
        ])->assertRedirect();

        $this->assertDatabaseHas('suppliers', ['id' => $supplier->id, 'code' => 'SUP-NEW', 'name' => 'Nama Baru']);
    }

    public function test_regular_user_only_sees_stock_from_assigned_warehouse(): void
    {
        $first = Warehouse::create(['code' => 'WH-ONE', 'name' => 'Gudang Satu', 'type' => 'unit']);
        $second = Warehouse::create(['code' => 'WH-TWO', 'name' => 'Gudang Dua', 'type' => 'unit']);
        $item = Item::create(['code' => 'STOCK-ITEM', 'name' => 'Stok Uji', 'base_uom' => 'PCS']);
        CurrentStock::create(['warehouse_id' => $first->id, 'item_id' => $item->id, 'qty_on_hand' => 10]);
        CurrentStock::create(['warehouse_id' => $second->id, 'item_id' => $item->id, 'qty_on_hand' => 20]);
        $user = User::factory()->create(['role' => UserRole::UnitUser, 'warehouse_id' => $first->id]);

        $this->actingAs($user)->get('/warehouse-stocks')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('WarehouseStock/Index')->has('stocks', 1)
            ->where('stocks.0.warehouse.id', $first->id)->where('summary.onHand', 10));
    }

    public function test_superadmin_can_see_all_warehouse_stocks(): void
    {
        $warehouse = Warehouse::create(['code' => 'WH-ALL', 'name' => 'Gudang Semua', 'type' => 'main']);
        $item = Item::create(['code' => 'ALL-ITEM', 'name' => 'Item Semua', 'base_uom' => 'PCS']);
        CurrentStock::create(['warehouse_id' => $warehouse->id, 'item_id' => $item->id, 'qty_on_hand' => 5]);
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);

        $this->actingAs($admin)->get('/warehouse-stocks')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('WarehouseStock/Index')->where('canViewAll', true)->has('stocks', 1));
    }

    public function test_unit_request_requires_unit_approval_preparation_and_warehouse_approval(): void
    {
        $main = Warehouse::create(['code' => 'WH-FLOW', 'name' => 'Gudang Kering', 'type' => 'main']);
        $unit = Warehouse::create(['code' => 'UNIT-FLOW', 'name' => 'Unit Peminta', 'type' => 'unit', 'main_warehouse_id' => $main->id]);
        $item = Item::create(['code' => 'FLOW-ITEM', 'name' => 'Item Request', 'base_uom' => 'PCS']);
        $secondItem = Item::create(['code' => 'FLOW-ITEM-2', 'name' => 'Item Request Kedua', 'base_uom' => 'PCS']);
        CurrentStock::create(['warehouse_id' => $main->id, 'item_id' => $item->id, 'batch_no' => 'B-FLOW', 'qty_on_hand' => 20, 'average_cost' => 1000]);
        CurrentStock::create(['warehouse_id' => $main->id, 'item_id' => $secondItem->id, 'batch_no' => 'B-FLOW-2', 'qty_on_hand' => 10, 'average_cost' => 2000]);
        $user = User::factory()->create(['role' => UserRole::UnitUser, 'warehouse_id' => $unit->id]);
        $unitManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $unit->id]);
        $warehouseAdmin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $main->id]);
        $warehouseManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $main->id]);

        $this->actingAs($user)->post('/operations/fulfillment/requests', ['from_warehouse_id' => $main->id, 'details' => [['item_id' => $item->id, 'qty' => 5], ['item_id' => $secondItem->id, 'qty' => 3]]])->assertRedirect();
        $stockRequest = StockRequest::firstOrFail();
        $this->assertCount(2, $stockRequest->details);
        $approval = WorkflowApproval::where('module', 'stock_request')->firstOrFail();
        $this->assertSame(2, $approval->total_levels);
        $this->assertSame($unitManager->id, $approval->steps()->where('level', 1)->value('approver_id'));
        $this->assertSame($warehouseManager->id, $approval->steps()->where('level', 2)->value('approver_id'));

        $this->actingAs($unitManager)->post("/workflow-approvals/{$approval->id}", ['action' => 'approved'])->assertRedirect();
        $this->actingAs($warehouseAdmin)->post("/operations/fulfillment/requests/{$stockRequest->id}/prepare")->assertRedirect();
        $this->actingAs($warehouseManager)->post("/workflow-approvals/{$approval->id}", ['action' => 'approved'])->assertRedirect();

        $this->assertSame('received', $stockRequest->fresh()->status);
        $this->assertSame(15.0, (float) CurrentStock::where('warehouse_id', $main->id)->where('item_id', $item->id)->sum('qty_on_hand'));
        $this->assertSame(7.0, (float) CurrentStock::where('warehouse_id', $main->id)->where('item_id', $secondItem->id)->sum('qty_on_hand'));
        $this->assertSame(8.0, (float) CurrentStock::where('warehouse_id', $unit->id)->sum('qty_on_hand'));
    }

    public function test_superadmin_can_request_stock_for_selected_unit(): void
    {
        $main = Warehouse::create(['code' => 'WH-SUPER-REQ', 'name' => 'Gudang Basah', 'type' => 'main']);
        $unit = Warehouse::create(['code' => 'UNIT-SUPER-REQ', 'name' => 'Unit Pilihan', 'type' => 'unit', 'main_warehouse_id' => $main->id]);
        $item = Item::create(['code' => 'SUPER-REQ-ITEM', 'name' => 'Item Super Request', 'base_uom' => 'PCS']);
        $superadmin = User::factory()->create(['role' => UserRole::Superadmin]);
        $unitManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $unit->id]);
        $warehouseManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $main->id]);

        $this->actingAs($superadmin)->post('/operations/fulfillment/requests', [
            'from_warehouse_id' => $main->id, 'to_warehouse_id' => $unit->id,
            'details' => [['item_id' => $item->id, 'qty' => 4]],
        ])->assertRedirect();

        $stockRequest = StockRequest::firstOrFail();
        $approval = WorkflowApproval::where('module', 'stock_request')->firstOrFail();
        $this->assertSame($unit->id, $stockRequest->to_warehouse_id);
        $this->assertSame($superadmin->id, $stockRequest->requested_by);
        $this->assertSame($unitManager->id, $approval->steps()->where('level', 1)->value('approver_id'));
        $this->assertSame($warehouseManager->id, $approval->steps()->where('level', 2)->value('approver_id'));
    }

    public function test_purchasing_and_grn_module_is_no_longer_accessible(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        $this->actingAs($admin)->get('/operations/purchasing')->assertNotFound();
        $this->actingAs($admin)->post('/operations/purchasing/purchase-orders')->assertNotFound();
        $this->actingAs($admin)->post('/operations/purchasing/goods-receipts')->assertNotFound();
    }

    public function test_stock_adjustment_and_opname_support_multiple_items(): void
    {
        $warehouse = Warehouse::create(['code' => 'WH-MULTI', 'name' => 'Gudang Multi', 'type' => 'main']);
        $first = Item::create(['code' => 'MULTI-1', 'name' => 'Item Multi Satu', 'base_uom' => 'PCS']);
        $second = Item::create(['code' => 'MULTI-2', 'name' => 'Item Multi Dua', 'base_uom' => 'PCS']);
        CurrentStock::create(['warehouse_id' => $warehouse->id, 'item_id' => $first->id, 'qty_on_hand' => 10, 'average_cost' => 100]);
        CurrentStock::create(['warehouse_id' => $warehouse->id, 'item_id' => $second->id, 'qty_on_hand' => 20, 'average_cost' => 200]);
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);

        $this->actingAs($admin)->post('/operations/inventory-control/adjustments', [
            'warehouse_id' => $warehouse->id, 'type' => 'correction', 'reason' => 'Koreksi multi item', 'approver_id' => $manager->id,
            'details' => [['item_id' => $first->id, 'qty' => 2, 'unit_price' => 100], ['item_id' => $second->id, 'qty' => -3, 'unit_price' => 200]],
        ])->assertRedirect();
        $this->assertCount(2, StockAdjustment::firstOrFail()->details);

        $this->actingAs($admin)->post('/operations/inventory-control/opnames', [
            'warehouse_id' => $warehouse->id, 'approver_id' => $manager->id,
            'details' => [['item_id' => $first->id, 'qty' => 9], ['item_id' => $second->id, 'qty' => 18]],
        ])->assertRedirect();
        $opname = StockOpname::firstOrFail();
        $this->assertCount(2, $opname->details);
        $this->assertSame([-1.0, -2.0], $opname->details->map(fn ($detail) => (float) $detail->diff_qty)->all());
        $this->assertCount(2, StockAdjustment::where('stock_opname_id', $opname->id)->firstOrFail()->details);
    }

    public function test_warehouse_admin_only_sees_and_uses_own_warehouse_for_inventory_control(): void
    {
        $own = Warehouse::create(['code' => 'WH-SCOPE-OWN', 'name' => 'Gudang Sendiri', 'type' => 'main']);
        $other = Warehouse::create(['code' => 'WH-SCOPE-OTHER', 'name' => 'Gudang Lain', 'type' => 'main']);
        $item = Item::create(['code' => 'SCOPE-ITEM', 'name' => 'Item Scope', 'base_uom' => 'PCS']);
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $own->id]);
        $ownManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $own->id]);
        $otherManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $other->id]);

        $this->actingAs($admin)->get('/operations/inventory-control')->assertOk()->assertInertia(fn ($page) => $page
            ->has('warehouses', 1)
            ->where('warehouses.0.id', $own->id)
            ->has('managers', 1)
            ->where('managers.0.id', $ownManager->id));

        $this->actingAs($admin)->post('/operations/inventory-control/adjustments', [
            'warehouse_id' => $other->id, 'type' => 'correction', 'reason' => 'Uji scope', 'approver_id' => $ownManager->id,
            'details' => [['item_id' => $item->id, 'qty' => 1]],
        ])->assertRedirect();

        $this->assertDatabaseHas('stock_adjustments', ['warehouse_id' => $own->id, 'assigned_approver_id' => $ownManager->id]);
        $this->assertDatabaseMissing('stock_adjustments', ['warehouse_id' => $other->id]);

        $this->actingAs($admin)->post('/operations/inventory-control/opnames', [
            'warehouse_id' => $own->id, 'approver_id' => $otherManager->id,
            'details' => [['item_id' => $item->id, 'qty' => 1]],
        ])->assertStatus(422);
    }

    public function test_stock_opname_only_accepts_items_available_in_selected_warehouse(): void
    {
        $warehouse = Warehouse::create(['code' => 'WH-OPNAME-ITEM', 'name' => 'Gudang Opname Item', 'type' => 'main']);
        $available = Item::create(['code' => 'OPNAME-AVAILABLE', 'name' => 'Item Tersedia', 'base_uom' => 'PCS']);
        $unavailable = Item::create(['code' => 'OPNAME-EMPTY', 'name' => 'Item Tidak Tersedia', 'base_uom' => 'PCS']);
        CurrentStock::create(['warehouse_id' => $warehouse->id, 'item_id' => $available->id, 'qty_on_hand' => 5]);
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);

        $this->actingAs($admin)->post('/operations/inventory-control/opnames', [
            'warehouse_id' => $warehouse->id, 'approver_id' => $manager->id,
            'details' => [['item_id' => $unavailable->id, 'qty' => 1]],
        ])->assertStatus(422);

        $this->assertDatabaseMissing('stock_opnames', ['warehouse_id' => $warehouse->id]);
    }
}
