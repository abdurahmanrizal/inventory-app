<?php

namespace Tests\Feature;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\Item;
use App\Models\StockTransaction;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockTransactionTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_submit_a_stock_out_request(): void
    {
        $warehouse = $this->warehouse('MAIN', 'Gudang Utama');
        $user = User::factory()->create(['email_verified_at' => now(), 'role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        $item = $this->item();

        $response = $this->actingAs($user)->post(route('stock-transactions.store'), [
            'type' => TransactionType::StockOut->value,
            'source_warehouse_id' => $warehouse->id,
            'document_date' => now()->toDateString(),
            'notes' => 'Pengeluaran operasional',
            'details' => [['item_id' => $item->id, 'qty' => 2, 'unit_cost' => 0, 'batch_no' => 'B-01']],
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('stock_transactions', [
            'type' => TransactionType::StockOut->value,
            'source_warehouse_id' => $warehouse->id,
            'status' => TransactionStatus::WaitingApproval->value,
        ]);
        $this->assertDatabaseHas('stock_transaction_details', ['item_id' => $item->id, 'qty' => 2]);
    }

    public function test_transfer_requires_a_destination_warehouse(): void
    {
        $warehouse = $this->warehouse('MAIN', 'Gudang Utama');
        $user = User::factory()->create(['email_verified_at' => now(), 'role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        $item = $this->item();

        $response = $this->actingAs($user)->from('/stock-transactions?type=transfer')->post(route('stock-transactions.store'), [
            'type' => TransactionType::Transfer->value,
            'source_warehouse_id' => $warehouse->id,
            'document_date' => now()->toDateString(),
            'details' => [['item_id' => $item->id, 'qty' => 1]],
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseCount('stock_transactions', 0);
    }

    public function test_user_can_download_a_transaction_document_as_pdf(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $warehouse = $this->warehouse('MAIN', 'Gudang Utama');
        $item = $this->item();
        $transaction = StockTransaction::create([
            'number' => 'STOCK_IN-TEST-01',
            'type' => TransactionType::StockIn,
            'destination_warehouse_id' => $warehouse->id,
            'document_date' => now()->toDateString(),
            'status' => TransactionStatus::WaitingApproval,
            'created_by' => $user->id,
        ]);
        $transaction->details()->create(['item_id' => $item->id, 'qty' => 5, 'unit_cost' => 15000, 'batch_no' => 'B-01']);

        $response = $this->actingAs($user)->get(route('stock-transactions.document', $transaction));

        $response->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $response->getContent());
    }

    public function test_warehouse_admin_can_create_supplier_receipt_for_own_warehouse(): void
    {
        $warehouse = $this->warehouse('WH-DRY', 'Gudang Kering');
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        $item = $this->item();

        $this->actingAs($admin)->post(route('stock-transactions.store'), [
            'type' => 'stock_in', 'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouse->id, 'supplier_name' => 'PT Pemasok',
            'document_date' => now()->toDateString(),
            'details' => [['item_id' => $item->id, 'qty' => 5, 'unit_cost' => 12000]],
        ])->assertRedirect();

        $this->assertDatabaseHas('stock_transactions', [
            'type' => 'stock_in', 'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouse->id, 'supplier_name' => 'PT Pemasok',
            'assigned_approver_id' => $manager->id,
        ]);
    }

    public function test_unit_user_cannot_create_transaction_from_stock_in_feature(): void
    {
        $main = $this->warehouse('WH-DRY', 'Gudang Kering');
        $unit = Warehouse::create(['code' => 'UNIT-A', 'name' => 'Unit A', 'type' => 'unit', 'main_warehouse_id' => $main->id, 'is_active' => true]);
        User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $unit->id]);
        $user = User::factory()->create(['role' => UserRole::UnitUser, 'warehouse_id' => $unit->id]);
        $item = $this->item();

        $this->actingAs($user)->post(route('stock-transactions.store'), [
            'type' => 'stock_in', 'request_kind' => 'unit_request',
            'source_warehouse_id' => $main->id, 'destination_warehouse_id' => $main->id, 'supplier_name' => 'Supplier palsu',
            'document_date' => now()->toDateString(),
            'details' => [['item_id' => $item->id, 'qty' => 3, 'unit_cost' => 999999]],
        ])->assertForbidden();

        $this->assertDatabaseCount('stock_transactions', 0);
    }

    public function test_superadmin_can_create_stock_out_from_selected_warehouse(): void
    {
        $warehouse = $this->warehouse('WH-LOCKED', 'Gudang Terkunci');
        $item = $this->item();
        $superadmin = User::factory()->create(['role' => UserRole::Superadmin]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);

        $payload = ['type' => 'stock_out', 'stock_out_reason' => 'operational', 'source_warehouse_id' => $warehouse->id, 'document_date' => now()->toDateString(), 'details' => [['item_id' => $item->id, 'qty' => 1]]];
        $this->actingAs($superadmin)->post(route('stock-transactions.store'), $payload)->assertRedirect();
        $this->actingAs($superadmin)->get('/stock-transactions?type=stock_in')->assertOk();
        $this->assertDatabaseHas('stock_transactions', ['source_warehouse_id' => $warehouse->id, 'assigned_approver_id' => $manager->id]);
    }

    public function test_warehouse_admin_cannot_send_stock_out_from_another_warehouse(): void
    {
        $own = $this->warehouse('WH-OWN', 'Gudang Sendiri');
        $other = $this->warehouse('WH-OTHER', 'Gudang Lain');
        $item = $this->item();
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $own->id]);
        User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $own->id]);

        $this->actingAs($admin)->post(route('stock-transactions.store'), ['type' => 'stock_out', 'source_warehouse_id' => $other->id, 'document_date' => now()->toDateString(), 'details' => [['item_id' => $item->id, 'qty' => 1]]])->assertRedirect();
        $this->assertDatabaseHas('stock_transactions', ['source_warehouse_id' => $own->id]);
        $this->assertDatabaseMissing('stock_transactions', ['source_warehouse_id' => $other->id]);
    }

    public function test_unit_admin_can_only_submit_stock_out_for_own_unit_manager(): void
    {
        $main = $this->warehouse('WH-MAIN-U', 'Gudang Utama Unit');
        $unit = Warehouse::create(['code' => 'UNIT-OUT', 'name' => 'Gudang Unit Out', 'type' => 'unit', 'main_warehouse_id' => $main->id]);
        $other = Warehouse::create(['code' => 'UNIT-OTHER', 'name' => 'Gudang Unit Lain', 'type' => 'unit', 'main_warehouse_id' => $main->id]);
        $item = $this->item();
        $admin = User::factory()->create(['role' => UserRole::UnitUser, 'warehouse_id' => $unit->id]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $unit->id]);

        $this->actingAs($admin)->post(route('stock-transactions.store'), ['type' => 'stock_out', 'stock_out_reason' => 'expired', 'source_warehouse_id' => $other->id, 'document_date' => now()->toDateString(), 'details' => [['item_id' => $item->id, 'qty' => 2]]])->assertRedirect();
        $this->assertDatabaseHas('stock_transactions', ['type' => 'stock_out', 'stock_out_reason' => 'expired', 'source_warehouse_id' => $unit->id, 'assigned_approver_id' => $manager->id]);

        $this->actingAs($admin)->post(route('stock-transactions.store'), ['type' => 'transfer', 'source_warehouse_id' => $unit->id, 'destination_warehouse_id' => $other->id, 'document_date' => now()->toDateString(), 'details' => [['item_id' => $item->id, 'qty' => 1]]])->assertForbidden();
    }

    public function test_manager_cannot_approve_another_units_request(): void
    {
        $main = $this->warehouse('WH-DRY', 'Gudang Kering');
        $unitA = Warehouse::create(['code' => 'UNIT-A', 'name' => 'Unit A', 'type' => 'unit', 'main_warehouse_id' => $main->id, 'is_active' => true]);
        $unitB = Warehouse::create(['code' => 'UNIT-B', 'name' => 'Unit B', 'type' => 'unit', 'main_warehouse_id' => $main->id, 'is_active' => true]);
        $managerA = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $unitA->id]);
        $managerB = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $unitB->id]);
        $transaction = StockTransaction::create([
            'number' => 'TRANSFER-UNIT-A', 'type' => TransactionType::Transfer, 'request_kind' => 'unit_request',
            'source_warehouse_id' => $main->id, 'destination_warehouse_id' => $unitA->id,
            'document_date' => now(), 'status' => TransactionStatus::WaitingApproval,
            'created_by' => $managerA->id, 'assigned_approver_id' => $managerA->id,
        ]);

        $this->actingAs($managerB)->post(route('approvals.approve', $transaction))->assertForbidden();
    }

    public function test_superadmin_can_access_manager_approval_page(): void
    {
        $superadmin = User::factory()->create(['role' => UserRole::Superadmin]);

        $this->actingAs($superadmin)
            ->get(route('approvals.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page->component('Approvals/Index'));
    }

    public function test_superadmin_can_filter_approval_by_warehouse(): void
    {
        $superadmin = User::factory()->create(['role' => UserRole::Superadmin]);
        $first = $this->warehouse('APPROVAL-A', 'Gudang Approval A');
        $second = $this->warehouse('APPROVAL-B', 'Gudang Approval B');
        foreach ([$first, $second] as $index => $warehouse) {
            StockTransaction::create(['number' => 'APPROVAL-FILTER-'.$index, 'type' => TransactionType::StockOut, 'source_warehouse_id' => $warehouse->id, 'document_date' => now(), 'status' => TransactionStatus::WaitingApproval, 'created_by' => $superadmin->id]);
        }

        $this->actingAs($superadmin)->get('/approvals?warehouse_id='.$second->id)->assertOk()->assertInertia(fn ($page) => $page
            ->where('canFilterWarehouse', true)->where('selectedWarehouse', $second->id)
            ->has('transactions.data', 1)->where('transactions.data.0.source_warehouse.id', $second->id));
    }

    private function warehouse(string $code, string $name): Warehouse
    {
        return Warehouse::create(['code' => $code, 'name' => $name, 'type' => 'main', 'is_active' => true]);
    }

    private function item(): Item
    {
        return Item::create([
            'code' => 'ITEM-01',
            'name' => 'Barang Uji',
            'base_uom' => 'PCS',
            'warehouse_type' => 'both',
            'valuation_method' => 'moving_average',
            'is_active' => true,
        ]);
    }
}
