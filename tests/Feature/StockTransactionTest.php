<?php

namespace Tests\Feature;

use App\Enums\InventoryValuationMethod;
use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\InventorySetting;
use App\Models\Item;
use App\Models\StockCostLayer;
use App\Models\StockTransaction;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\InventoryValuationService;
use App\Support\PendingApprovalStats;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    public function test_stock_in_document_shows_supplier_document_time_and_approval_time(): void
    {
        $user = User::factory()->create(['email_verified_at' => now()]);
        $warehouse = $this->warehouse('DOC-IN', 'Gudang Dokumen Masuk');
        $item = $this->item();
        $transaction = StockTransaction::create([
            'number' => 'STOCK_IN-DOC-META',
            'type' => TransactionType::StockIn,
            'destination_warehouse_id' => $warehouse->id,
            'supplier_name' => 'PT Supplier Teruji',
            'document_date' => '2026-08-08',
            'status' => TransactionStatus::Completed,
            'created_by' => $user->id,
            'approved_by' => $user->id,
            'approved_at' => '2026-08-09 14:35:00',
        ]);
        $transaction->forceFill(['created_at' => '2026-08-08 09:17:00'])->save();
        $transaction->details()->create(['item_id' => $item->id, 'qty' => 1, 'unit_cost' => 100]);
        $transaction->load(['details.item', 'sourceWarehouse', 'destinationWarehouse', 'creator', 'approver']);

        $html = view('documents.stock-transaction', ['transaction' => $transaction])->render();

        $this->assertStringContainsString('PT Supplier Teruji', $html);
        $this->assertStringContainsString('08/08/2026 09:17', $html);
        $this->assertStringContainsString('09/08/2026 14:35', $html);
    }

    public function test_unit_return_document_shows_both_manager_approvals_and_signatures(): void
    {
        $main = $this->warehouse('DOC-RETURN-MAIN', 'Gudang Utama Dokumen');
        $unit = Warehouse::create(['code' => 'DOC-RETURN-UNIT', 'name' => 'Gudang Unit Dokumen', 'type' => 'unit', 'main_warehouse_id' => $main->id]);
        $item = $this->item();
        $creator = User::factory()->create(['role' => UserRole::UnitUser, 'warehouse_id' => $unit->id]);
        $unitManager = User::factory()->create(['name' => 'Manajer Unit Dokumen', 'role' => UserRole::UnitManager, 'warehouse_id' => $unit->id]);
        $mainManager = User::factory()->create(['name' => 'Manajer Utama Dokumen', 'role' => UserRole::UnitManager, 'warehouse_id' => $main->id]);
        $transaction = StockTransaction::create([
            'number' => 'RETURN-DOC-001', 'type' => TransactionType::Transfer, 'request_kind' => 'unit_return',
            'stock_out_reason' => 'restitution', 'source_warehouse_id' => $unit->id, 'destination_warehouse_id' => $main->id,
            'document_date' => '2026-08-08', 'status' => TransactionStatus::Completed, 'created_by' => $creator->id,
            'approved_by' => $mainManager->id, 'approved_at' => '2026-08-10 16:45:00',
        ]);
        $transaction->details()->create(['item_id' => $item->id, 'qty' => 2, 'unit_cost' => 100]);
        $transaction->approvals()->create(['level' => 1, 'approver_id' => $unitManager->id, 'status' => 'approved', 'acted_at' => '2026-08-09 09:15:00']);
        $transaction->approvals()->create(['level' => 2, 'approver_id' => $mainManager->id, 'status' => 'approved', 'acted_at' => '2026-08-10 16:45:00']);
        $transaction->load(['details.item', 'sourceWarehouse', 'destinationWarehouse', 'creator', 'approver', 'approvals.approver']);

        $html = view('documents.stock-transaction', ['transaction' => $transaction])->render();

        $this->assertStringContainsString('Disetujui Manajer Gudang Unit', $html);
        $this->assertStringContainsString('Disetujui Manajer Gudang Utama', $html);
        $this->assertStringContainsString('09/08/2026 09:15', $html);
        $this->assertStringContainsString('10/08/2026 16:45', $html);
        $this->assertStringContainsString('Manajer Unit Dokumen', $html);
        $this->assertStringContainsString('Manajer Utama Dokumen', $html);
    }

    public function test_user_can_download_stock_out_document_with_current_hpp(): void
    {
        $warehouse = $this->warehouse('DOC-OUT', 'Gudang Dokumen Stock Out');
        $item = $this->item();
        $user = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        CurrentStock::create([
            'warehouse_id' => $warehouse->id,
            'item_id' => $item->id,
            'batch_no' => 'DOC-BATCH',
            'qty_on_hand' => 10,
            'qty_reserved' => 0,
            'average_cost' => 17500,
        ]);
        $transaction = StockTransaction::create([
            'number' => 'STOCK_OUT-DOC-01',
            'type' => TransactionType::StockOut,
            'stock_out_reason' => 'damaged',
            'source_warehouse_id' => $warehouse->id,
            'document_date' => now(),
            'status' => TransactionStatus::WaitingApproval,
            'created_by' => $user->id,
        ]);
        $transaction->details()->create([
            'item_id' => $item->id,
            'qty' => 2,
            'unit_cost' => 0,
            'batch_no' => 'DOC-BATCH',
        ]);

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

    public function test_stock_in_images_are_compressed_and_stored_privately(): void
    {
        Storage::fake('local');
        $warehouse = $this->warehouse('WH-EVIDENCE', 'Gudang Bukti');
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        $item = $this->item();

        $this->actingAs($admin)->post(route('stock-transactions.store'), [
            'type' => 'stock_in',
            'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouse->id,
            'supplier_name' => 'PT Dengan Bukti',
            'document_date' => now()->toDateString(),
            'receipt_image' => UploadedFile::fake()->image('nota.png', 2400, 1800),
            'payment_proof_image' => UploadedFile::fake()->image('bayar.png', 2000, 2000),
            'delivery_proof_image' => UploadedFile::fake()->image('pengiriman.png', 2200, 1800),
            'details' => [['item_id' => $item->id, 'qty' => 5, 'unit_cost' => 12000]],
        ])->assertRedirect();

        $transaction = StockTransaction::where('supplier_name', 'PT Dengan Bukti')->firstOrFail();
        Storage::disk('local')->assertExists($transaction->receipt_image_path);
        Storage::disk('local')->assertExists($transaction->payment_proof_image_path);
        Storage::disk('local')->assertExists($transaction->delivery_proof_image_path);
        [$width, $height] = getimagesize(Storage::disk('local')->path($transaction->receipt_image_path));
        $this->assertLessThanOrEqual(1600, max($width, $height));
        $this->assertStringEndsWith('.jpg', $transaction->receipt_image_path);
        $this->actingAs($admin)
            ->get(route('stock-transactions.evidence', [$transaction, 'receipt']))
            ->assertOk()
            ->assertHeader('content-type', 'image/jpeg');
        $this->actingAs($admin)
            ->get(route('stock-transactions.evidence', [$transaction, 'delivery']))
            ->assertOk()
            ->assertHeader('content-type', 'image/jpeg');
    }

    public function test_stock_in_only_updates_stock_after_main_warehouse_manager_approval(): void
    {
        $warehouse = $this->warehouse('WH-APPROVE-IN', 'Gudang Utama Kering');
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        $item = $this->item();

        $this->actingAs($admin)->post(route('stock-transactions.store'), [
            'type' => 'stock_in',
            'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouse->id,
            'document_date' => now()->toDateString(),
            'details' => [['item_id' => $item->id, 'qty' => 8, 'unit_cost' => 15000, 'batch_no' => 'IN-APPROVE']],
        ])->assertRedirect();

        $transaction = StockTransaction::where('destination_warehouse_id', $warehouse->id)->firstOrFail();
        $this->assertSame(TransactionStatus::WaitingApproval, $transaction->status);
        $this->assertSame($manager->id, $transaction->assigned_approver_id);
        $this->assertDatabaseMissing('current_stocks', ['warehouse_id' => $warehouse->id, 'item_id' => $item->id]);

        $this->actingAs($manager)->post(route('approvals.approve', $transaction))->assertRedirect();

        $this->assertDatabaseHas('current_stocks', [
            'warehouse_id' => $warehouse->id,
            'item_id' => $item->id,
            'batch_no' => 'IN-APPROVE',
            'qty_on_hand' => 8,
        ]);
        $this->assertSame(TransactionStatus::Completed, $transaction->fresh()->status);
    }

    public function test_wet_warehouse_admin_stock_in_lists_active_wet_and_shared_items_without_existing_stock(): void
    {
        $warehouse = $this->warehouse('WH-WET-ITEMS', 'Gudang Utama Basah');
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminWet, 'warehouse_id' => $warehouse->id]);
        $wet = Item::create(['code' => 'WET-NEW', 'name' => 'Item Basah Baru', 'base_uom' => 'KG', 'warehouse_type' => 'wet', 'is_active' => true]);
        $shared = Item::create(['code' => 'BOTH-NEW', 'name' => 'Item Bersama Baru', 'base_uom' => 'PCS', 'warehouse_type' => 'both', 'is_active' => true]);
        Item::create(['code' => 'DRY-NEW', 'name' => 'Item Kering Baru', 'base_uom' => 'PCS', 'warehouse_type' => 'dry', 'is_active' => true]);
        Item::create(['code' => 'WET-INACTIVE', 'name' => 'Item Basah Nonaktif', 'base_uom' => 'KG', 'warehouse_type' => 'wet', 'is_active' => false]);

        $this->actingAs($admin)
            ->get('/stock-transactions?type=stock_in')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('items', 2)
                ->where('items', fn ($items) => collect($items)->pluck('id')->sort()->values()->all() === collect([$wet->id, $shared->id])->sort()->values()->all())
                ->where('userWarehouse.id', $warehouse->id));

        $this->assertDatabaseCount('current_stocks', 0);
    }

    public function test_wet_warehouse_admin_cannot_submit_dry_item_to_stock_in(): void
    {
        $warehouse = $this->warehouse('WH-WET-VALIDATION', 'Gudang Utama Basah');
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminWet, 'warehouse_id' => $warehouse->id]);
        User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        $dry = Item::create(['code' => 'DRY-FORGED', 'name' => 'Item Kering', 'base_uom' => 'PCS', 'warehouse_type' => 'dry', 'is_active' => true]);

        $this->actingAs($admin)->post(route('stock-transactions.store'), [
            'type' => 'stock_in',
            'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouse->id,
            'document_date' => now()->toDateString(),
            'details' => [['item_id' => $dry->id, 'qty' => 1, 'unit_cost' => 1000]],
        ])->assertStatus(422);

        $this->assertDatabaseCount('stock_transactions', 0);
    }

    public function test_stock_in_requires_positive_hpp_for_every_item(): void
    {
        $warehouse = $this->warehouse('WH-HPP-REQUIRED', 'Gudang Utama Kering');
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        $item = $this->item();

        foreach ([null, '', 0, -100] as $invalidCost) {
            $this->actingAs($admin)->postJson(route('stock-transactions.store'), [
                'type' => 'stock_in',
                'request_kind' => 'supplier_receipt',
                'destination_warehouse_id' => $warehouse->id,
                'document_date' => now()->toDateString(),
                'details' => [['item_id' => $item->id, 'qty' => 1, 'unit_cost' => $invalidCost]],
            ])->assertUnprocessable()->assertJsonValidationErrors('details.0.unit_cost');
        }

        $this->assertDatabaseCount('stock_transactions', 0);
    }

    public function test_stock_in_prefers_scoped_warehouse_manager_over_global_manager(): void
    {
        $warehouse = $this->warehouse('WH-SCOPED-DRY', 'Gudang Utama Kering');
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        $scopedManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        $globalManager = User::factory()->create(['role' => UserRole::WarehouseManager, 'warehouse_id' => null]);
        $item = $this->item();

        $this->actingAs($admin)->post(route('stock-transactions.store'), [
            'type' => 'stock_in', 'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouse->id, 'document_date' => now()->toDateString(),
            'details' => [['item_id' => $item->id, 'qty' => 4, 'unit_cost' => 1000]],
        ])->assertRedirect();

        $transaction = StockTransaction::latest('id')->firstOrFail();
        $this->assertSame($scopedManager->id, $transaction->assigned_approver_id);
        $this->assertDatabaseHas('approvals', [
            'stock_transaction_id' => $transaction->id,
            'approver_id' => $scopedManager->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseMissing('approvals', [
            'stock_transaction_id' => $transaction->id,
            'approver_id' => $globalManager->id,
            'status' => 'pending',
        ]);
        $this->assertDatabaseHas('notifications', [
            'type' => 'stock-transaction.approval_required',
            'notifiable_id' => $scopedManager->id,
        ]);
        $this->assertDatabaseHas('notifications', [
            'type' => 'stock-transaction.approval_required',
            'notifiable_id' => $globalManager->id,
        ]);
        $this->actingAs($scopedManager)->get(route('approvals.index'))
            ->assertOk()->assertInertia(fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.id', $transaction->id)
            ->where('transactions.data.0.details.0.item.base_uom', 'PCS'));
        $this->actingAs($globalManager)->get(route('approvals.index'))
            ->assertOk()->assertInertia(fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.id', $transaction->id)
            ->where('warehouseCounts.'.$warehouse->id, 1));
        $this->actingAs($globalManager)->getJson(route('notifications.index'))
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('items.0.data.main_warehouse_id', $warehouse->id)
            ->assertJsonPath('items.0.data.module', 'stock_transaction');

        $this->actingAs($globalManager)->post(route('approvals.approve', $transaction))->assertRedirect();
        $this->assertSame(TransactionStatus::Completed, $transaction->fresh()->status);
        $this->assertSame($globalManager->id, $transaction->fresh()->approved_by);
        $this->assertDatabaseHas('approvals', [
            'stock_transaction_id' => $transaction->id,
            'approver_id' => $globalManager->id,
            'status' => 'approved',
        ]);
    }

    public function test_global_manager_badge_count_matches_visible_fallback_approval(): void
    {
        $warehouse = $this->warehouse('WH-GLOBAL-BADGE', 'Gudang Utama Kering');
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $warehouse->id]);
        $globalManager = User::factory()->create(['role' => UserRole::WarehouseManager, 'warehouse_id' => null]);
        $item = $this->item();

        $this->actingAs($admin)->post(route('stock-transactions.store'), [
            'type' => 'stock_in', 'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouse->id, 'document_date' => now()->toDateString(),
            'details' => [['item_id' => $item->id, 'qty' => 2, 'unit_cost' => 500]],
        ])->assertRedirect();

        $stats = PendingApprovalStats::forWarehouseManager($globalManager);
        $this->assertSame(1, $stats['counts']->get($warehouse->id));
        $this->actingAs($globalManager)->get(route('approvals.index'))
            ->assertOk()->assertInertia(fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('warehouseCounts.'.$warehouse->id, 1));
    }

    public function test_rejected_stock_in_does_not_update_stock(): void
    {
        $warehouse = $this->warehouse('WH-REJECT-IN', 'Gudang Utama Basah');
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminWet, 'warehouse_id' => $warehouse->id]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        $item = $this->item();
        $transaction = StockTransaction::create([
            'number' => 'STOCK-IN-REJECT',
            'type' => TransactionType::StockIn,
            'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouse->id,
            'document_date' => now(),
            'status' => TransactionStatus::WaitingApproval,
            'created_by' => $admin->id,
            'assigned_approver_id' => $manager->id,
        ]);
        $transaction->details()->create(['item_id' => $item->id, 'qty' => 5, 'unit_cost' => 10000]);

        $this->actingAs($manager)->post(route('approvals.reject', $transaction), [
            'remarks' => 'Bukti pembayaran tidak sesuai.',
        ])->assertRedirect();

        $this->assertSame(TransactionStatus::Rejected, $transaction->fresh()->status);
        $this->assertSame(0, CurrentStock::where('warehouse_id', $warehouse->id)->where('item_id', $item->id)->count());
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

        $this->actingAs($admin)->post(route('stock-transactions.store'), ['type' => 'stock_out', 'stock_out_reason' => 'operational', 'source_warehouse_id' => $other->id, 'document_date' => now()->toDateString(), 'details' => [['item_id' => $item->id, 'qty' => 2]]])->assertRedirect();
        $this->assertDatabaseHas('stock_transactions', ['type' => 'stock_out', 'stock_out_reason' => 'operational', 'source_warehouse_id' => $unit->id, 'assigned_approver_id' => $manager->id]);

        $this->actingAs($admin)->post(route('stock-transactions.store'), ['type' => 'transfer', 'source_warehouse_id' => $unit->id, 'destination_warehouse_id' => $other->id, 'document_date' => now()->toDateString(), 'details' => [['item_id' => $item->id, 'qty' => 1]]])->assertForbidden();
    }

    public function test_fifo_unit_return_uses_source_layer_main_warehouse_and_two_approvals(): void
    {
        $configuredMain = $this->warehouse('RETURN-MAIN-A', 'Gudang Utama A');
        $sourceMain = $this->warehouse('RETURN-MAIN-B', 'Gudang Utama B');
        $unit = Warehouse::create(['code' => 'RETURN-UNIT', 'name' => 'Gudang Unit Retur', 'type' => 'unit', 'main_warehouse_id' => $configuredMain->id]);
        $item = $this->item();
        $unitUser = User::factory()->create(['role' => UserRole::UnitUser, 'warehouse_id' => $unit->id]);
        $unitManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $unit->id]);
        $mainManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $sourceMain->id]);
        InventorySetting::current()->update(['valuation_method' => InventoryValuationMethod::Fifo]);
        $valuation = app(InventoryValuationService::class);
        $valuation->receive($sourceMain->id, $item->id, 5, 125, 'RETURN-BATCH', null, null, null, 'test', 1, $unitUser->id);
        $allocation = $valuation->issue($sourceMain->id, $item->id, 5, 'RETURN-BATCH', 'test', 2, $unitUser->id)[0];
        $valuation->receive(
            $unit->id, $item->id, 5, $allocation['unit_cost'], $allocation['batch_no'], null, null, null,
            'test', 3, $unitUser->id, null, false, $allocation['source_received_at'], $allocation['source_cost_layer_id'],
        );

        $this->actingAs($unitUser)->post(route('stock-transactions.store'), [
            'type' => 'stock_out',
            'stock_out_reason' => 'restitution',
            'source_warehouse_id' => $configuredMain->id,
            'document_date' => now()->toDateString(),
            'details' => [['item_id' => $item->id, 'qty' => 3, 'batch_no' => 'RETURN-BATCH']],
        ])->assertRedirect();

        $transaction = StockTransaction::latest('id')->firstOrFail();
        $this->assertSame(TransactionType::Transfer, $transaction->type);
        $this->assertSame('unit_return', $transaction->request_kind);
        $this->assertSame($unit->id, $transaction->source_warehouse_id);
        $this->assertSame($sourceMain->id, $transaction->destination_warehouse_id);
        $this->assertSame($unitManager->id, $transaction->assigned_approver_id);

        $this->actingAs($unitManager)->post(route('approvals.approve', $transaction))->assertRedirect();
        $this->assertSame($mainManager->id, $transaction->fresh()->assigned_approver_id);
        $this->assertSame(TransactionStatus::WaitingApproval, $transaction->fresh()->status);

        $this->actingAs($mainManager)->post(route('approvals.approve', $transaction))->assertRedirect();
        $this->assertSame(TransactionStatus::Completed, $transaction->fresh()->status);
        $this->assertSame(2.0, (float) CurrentStock::where('warehouse_id', $unit->id)->where('item_id', $item->id)->value('qty_on_hand'));
        $this->assertSame(3.0, (float) CurrentStock::where('warehouse_id', $sourceMain->id)->where('item_id', $item->id)->value('qty_on_hand'));
        $returnedLayer = StockCostLayer::where('warehouse_id', $sourceMain->id)->latest('id')->firstOrFail();
        $this->assertNotNull($returnedLayer->source_cost_layer_id);
        $this->assertSame(3.0, (float) $returnedLayer->remaining_qty);
    }

    public function test_moving_average_unit_return_uses_configured_main_and_lists_only_session_stock_items(): void
    {
        $main = $this->warehouse('AVG-RETURN-MAIN', 'Gudang Utama Average');
        $unit = Warehouse::create(['code' => 'AVG-RETURN-UNIT', 'name' => 'Gudang Unit Average', 'type' => 'unit', 'main_warehouse_id' => $main->id]);
        $item = $this->item();
        Item::create(['code' => 'NO-SESSION-STOCK', 'name' => 'Tanpa Stok Unit', 'base_uom' => 'PCS', 'warehouse_type' => 'both']);
        $unitUser = User::factory()->create(['role' => UserRole::UnitUser, 'warehouse_id' => $unit->id]);
        $unitManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $unit->id]);
        $mainManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $main->id]);
        CurrentStock::create([
            'warehouse_id' => $unit->id, 'item_id' => $item->id, 'qty_on_hand' => 6,
            'qty_reserved' => 1, 'average_cost' => 175,
        ]);

        $this->actingAs($unitUser)->get('/stock-transactions?type=stock_out')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->has('items', 1)
                ->where('items.0.id', $item->id)
                ->where('items.0.available_qty', 5)
                ->missing('items.1'));

        $this->actingAs($unitUser)->post(route('stock-transactions.store'), [
            'type' => 'stock_out', 'stock_out_reason' => 'restitution',
            'source_warehouse_id' => $main->id, 'document_date' => now()->toDateString(),
            'details' => [['item_id' => $item->id, 'qty' => 2]],
        ])->assertRedirect();

        $transaction = StockTransaction::latest('id')->firstOrFail();
        $this->assertSame($main->id, $transaction->destination_warehouse_id);
        $this->actingAs($unitManager)->post(route('approvals.approve', $transaction))->assertRedirect();
        $this->actingAs($mainManager)->post(route('approvals.approve', $transaction))->assertRedirect();
        $this->assertSame(4.0, (float) CurrentStock::where('warehouse_id', $unit->id)->where('item_id', $item->id)->value('qty_on_hand'));
        $this->assertSame(2.0, (float) CurrentStock::where('warehouse_id', $main->id)->where('item_id', $item->id)->value('qty_on_hand'));
        $this->assertSame(175.0, (float) CurrentStock::where('warehouse_id', $main->id)->where('item_id', $item->id)->value('average_cost'));
    }

    public function test_main_warehouse_stock_out_is_assigned_only_to_its_own_manager(): void
    {
        $main = $this->warehouse('WH-MAIN-OUT', 'Gudang Utama Kering');
        $unit = Warehouse::create(['code' => 'UNIT-CHILD', 'name' => 'Gudang Unit Turunan', 'type' => 'unit', 'main_warehouse_id' => $main->id, 'is_active' => true]);
        $item = $this->item();
        $admin = User::factory()->create(['role' => UserRole::WarehouseAdminDry, 'warehouse_id' => $main->id]);
        $mainManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $main->id]);
        $unitManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $unit->id]);
        CurrentStock::create([
            'warehouse_id' => $main->id,
            'item_id' => $item->id,
            'batch_no' => 'B-HPP',
            'qty_on_hand' => 10,
            'qty_reserved' => 0,
            'average_cost' => 12500,
        ]);

        $this->actingAs($admin)->post(route('stock-transactions.store'), [
            'type' => 'stock_out',
            'stock_out_reason' => 'operational',
            'source_warehouse_id' => $main->id,
            'document_date' => now()->toDateString(),
            'details' => [['item_id' => $item->id, 'qty' => 2, 'batch_no' => 'B-HPP']],
        ])->assertRedirect();

        $transaction = StockTransaction::where('source_warehouse_id', $main->id)->firstOrFail();
        $this->assertSame($mainManager->id, $transaction->assigned_approver_id);
        $this->assertDatabaseHas('approvals', ['stock_transaction_id' => $transaction->id, 'approver_id' => $mainManager->id, 'status' => 'pending']);
        $this->assertDatabaseMissing('approvals', ['stock_transaction_id' => $transaction->id, 'approver_id' => $unitManager->id]);

        $this->actingAs($mainManager)->get(route('approvals.index'))->assertOk()->assertInertia(fn ($page) => $page
            ->has('transactions.data', 1)
            ->where('transactions.data.0.id', $transaction->id)
            ->where('transactions.data.0.details.0.current_hpp', '12500.00'));
        $this->actingAs($unitManager)->get(route('approvals.index'))->assertOk()->assertInertia(fn ($page) => $page
            ->has('transactions.data', 0));
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
