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
use App\Models\StockLedger;
use App\Models\StockTransaction;
use App\Models\User;
use App\Models\Warehouse;
use App\Services\InventoryReportExport;
use App\Services\InventoryReportService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;
use ZipArchive;

class InventoryReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_view_stock_ledger_report(): void
    {
        $warehouse = Warehouse::create(['code' => 'REP-MAIN', 'name' => 'Gudang Laporan', 'type' => 'main']);
        $item = Item::create(['code' => 'REP-ITEM', 'name' => 'Item Laporan', 'base_uom' => 'PCS']);
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        $this->ledger($warehouse, $item, $admin, 'in', 10, now()->subDays(5));
        $this->ledger($warehouse, $item, $admin, 'out', 3, now()->subDay());

        $this->actingAs($admin)->get('/reports?report=ledger&date_from='.now()->subMonth()->format('Y-m-d').'&date_to='.now()->format('Y-m-d'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Reports/Index')
            ->where('data.summary.in', 10)
            ->where('data.summary.out', 3)
            ->where('data.summary.closing', 7)
            ->has('data.rows', 2));
    }

    public function test_stock_ledger_shows_stock_out_reason(): void
    {
        $warehouse = Warehouse::create(['code' => 'REP-OUT-REASON', 'name' => 'Gudang Alasan Keluar', 'type' => 'main']);
        $item = Item::create(['code' => 'REP-OUT-ITEM', 'name' => 'Item Keluar', 'base_uom' => 'PCS']);
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        $transaction = StockTransaction::create([
            'number' => 'OUT-REASON-001', 'type' => TransactionType::StockOut,
            'stock_out_reason' => 'waste', 'source_warehouse_id' => $warehouse->id,
            'document_date' => now(), 'status' => TransactionStatus::Completed, 'created_by' => $admin->id,
        ]);
        StockLedger::create([
            'stock_transaction_id' => $transaction->id, 'reference_type' => 'stock_transaction',
            'reference_id' => $transaction->id, 'warehouse_id' => $warehouse->id, 'item_id' => $item->id,
            'direction' => 'out', 'qty' => 2, 'unit_cost' => 1000, 'balance_qty' => 3,
            'balance_cost' => 1000, 'created_by' => $admin->id, 'created_at' => now(),
        ]);

        $this->actingAs($admin)->get('/reports?report=ledger&date_from='.now()->format('Y-m-d').'&date_to='.now()->format('Y-m-d'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('data.rows.0.reference', 'OUT-REASON-001')
            ->where('data.rows.0.movement_note', 'Waste / terbuang'));

        $data = app(InventoryReportService::class)->stockLedger(collect([$warehouse->id]), $warehouse->id, [
            'date_from' => now()->format('Y-m-d'), 'date_to' => now()->format('Y-m-d'),
        ]);
        [$headers, $rows] = app(InventoryReportExport::class)->table('ledger', $data);
        $this->assertContains('Keterangan Pengeluaran', $headers);
        $this->assertSame('Waste / terbuang', $rows[1][3]);
    }

    public function test_manager_report_is_limited_to_assigned_warehouse(): void
    {
        $own = Warehouse::create(['code' => 'REP-OWN', 'name' => 'Gudang Sendiri', 'type' => 'unit']);
        $other = Warehouse::create(['code' => 'REP-OTHER', 'name' => 'Gudang Lain', 'type' => 'unit']);
        $item = Item::create(['code' => 'REP-SCOPE', 'name' => 'Item Scope', 'base_uom' => 'PCS']);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $own->id]);
        $this->ledger($own, $item, $manager, 'in', 4, now());
        $this->ledger($other, $item, $manager, 'in', 9, now());

        $this->actingAs($manager)->get('/reports')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->has('data.rows', 1)
            ->where('data.rows.0.warehouse.id', $own->id));
    }

    public function test_report_item_options_only_include_stock_from_accessible_warehouses(): void
    {
        $firstWarehouse = Warehouse::create(['code' => 'REP-FILTER-1', 'name' => 'Gudang Filter Satu', 'type' => 'main']);
        $secondWarehouse = Warehouse::create(['code' => 'REP-FILTER-2', 'name' => 'Gudang Filter Dua', 'type' => 'main']);
        $firstItem = Item::create(['code' => 'REP-FIRST', 'name' => 'Item Pertama', 'base_uom' => 'PCS']);
        $secondItem = Item::create(['code' => 'REP-SECOND', 'name' => 'Item Kedua', 'base_uom' => 'KG']);
        $emptyItem = Item::create(['code' => 'REP-EMPTY', 'name' => 'Item Tanpa Stok', 'base_uom' => 'PCS']);
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);

        CurrentStock::create(['warehouse_id' => $firstWarehouse->id, 'item_id' => $firstItem->id, 'qty_on_hand' => 5, 'qty_reserved' => 0, 'average_cost' => 1000]);
        CurrentStock::create(['warehouse_id' => $secondWarehouse->id, 'item_id' => $secondItem->id, 'qty_on_hand' => 7, 'qty_reserved' => 0, 'average_cost' => 2000]);
        CurrentStock::create(['warehouse_id' => $firstWarehouse->id, 'item_id' => $emptyItem->id, 'qty_on_hand' => 0, 'qty_reserved' => 0, 'average_cost' => 0]);

        $this->actingAs($admin)->get('/reports?warehouse_id='.$firstWarehouse->id)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('items', 2)
                ->where('items', fn ($items) => collect($items)->contains(fn ($item) => $item['id'] === $firstItem->id && $item['warehouse_ids'] === [$firstWarehouse->id])
                    && collect($items)->contains(fn ($item) => $item['id'] === $secondItem->id && $item['warehouse_ids'] === [$secondWarehouse->id])));
    }

    public function test_user_without_report_permission_cannot_open_reports(): void
    {
        $user = User::factory()->create(['role' => UserRole::UnitUser]);
        $this->actingAs($user)->get('/reports')->assertForbidden();
    }

    public function test_valuation_report_calculates_current_stock_value(): void
    {
        $warehouse = Warehouse::create(['code' => 'REP-VAL', 'name' => 'Gudang Nilai', 'type' => 'main']);
        $item = Item::create(['code' => 'REP-VALUE', 'name' => 'Item Nilai', 'base_uom' => 'PCS']);
        $admin = User::factory()->create();
        CurrentStock::create(['warehouse_id' => $warehouse->id, 'item_id' => $item->id, 'qty_on_hand' => 5, 'qty_reserved' => 0, 'average_cost' => 2000]);

        $this->actingAs($admin)->get('/reports?report=valuation')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('data.summary.qty', 5)
            ->where('data.summary.value', 10000));
    }

    public function test_every_report_tab_can_be_opened_without_data(): void
    {
        $admin = User::factory()->create();

        foreach (['ledger', 'slow-moving', 'opname', 'valuation', 'cost-history', 'financial-movement', 'issue-cost', 'valuation-audit', 'anomalies', 'purchase-history'] as $report) {
            $this->actingAs($admin)->get('/reports?report='.$report)
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Reports/Index')
                    ->where('report', $report));
        }
    }

    public function test_purchase_history_only_uses_approved_and_posted_supplier_stock_in(): void
    {
        $warehouse = Warehouse::create(['code' => 'REP-BUY', 'name' => 'Gudang Pembelian', 'type' => 'main']);
        $item = Item::create(['code' => 'BUY-ITEM', 'name' => 'Item Pembelian', 'base_uom' => 'PCS']);
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        InventorySetting::current()->update(['valuation_method' => InventoryValuationMethod::Fifo]);
        $transaction = StockTransaction::create([
            'number' => 'IN-BUY-001', 'type' => TransactionType::StockIn, 'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouse->id, 'supplier_name' => 'Supplier Pembelian',
            'document_date' => now(), 'status' => TransactionStatus::Completed, 'created_by' => $admin->id,
            'approved_by' => $manager->id, 'approved_at' => now(), 'posted_at' => now(),
        ]);
        $transaction->details()->create(['item_id' => $item->id, 'qty' => 6, 'unit_cost' => 110, 'batch_no' => 'BUY-BATCH']);
        $waiting = StockTransaction::create([
            'number' => 'IN-WAITING', 'type' => TransactionType::StockIn, 'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouse->id, 'supplier_name' => 'Supplier Belum Disetujui',
            'document_date' => now(), 'status' => TransactionStatus::WaitingApproval, 'created_by' => $admin->id,
        ]);
        $waiting->details()->create(['item_id' => $item->id, 'qty' => 99, 'unit_cost' => 999]);
        $layer = StockCostLayer::create([
            'warehouse_id' => $warehouse->id, 'item_id' => $item->id, 'batch_no' => 'BUY-BATCH',
            'received_at' => now(), 'original_qty' => 6, 'remaining_qty' => 6, 'unit_cost' => 110,
            'reference_type' => 'stock_transaction', 'reference_id' => $transaction->id,
        ]);

        $this->actingAs($admin)->get('/reports?report=purchase-history&date_from='.now()->format('Y-m-d').'&date_to='.now()->format('Y-m-d'))
            ->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('data.summary.transactions', 1)
            ->where('data.summary.qty', 6)
            ->where('data.summary.totalValue', 660)
            ->has('data.rows', 1)
            ->where('data.rows.0.fifo_layer_ids.0', $layer->id)
            ->where('data.rows.0.transaction_number', 'IN-BUY-001')
            ->where('data.rows.0.approved_by_name', $manager->name));

        $this->actingAs($admin)->get('/reports/export/xlsx?report=purchase-history&date_from='.now()->format('Y-m-d').'&date_to='.now()->format('Y-m-d'))->assertOk();
        $this->actingAs($admin)->get('/reports/export/pdf?report=purchase-history&date_from='.now()->format('Y-m-d').'&date_to='.now()->format('Y-m-d'))->assertOk();

        $reportData = app(InventoryReportService::class)->purchaseHistory(
            collect([$warehouse->id]),
            $warehouse->id,
            ['date_from' => now()->format('Y-m-d'), 'date_to' => now()->format('Y-m-d')],
        );
        [, $exportRows] = app(InventoryReportExport::class)->table('purchase-history', $reportData);
        $this->assertSame('subtotal', $exportRows[array_key_last($exportRows)]['_type']);
        $this->assertSame('GRAND TOTAL', $exportRows[array_key_last($exportRows)]['cells'][0]);
        $this->assertSame(660.0, $exportRows[array_key_last($exportRows)]['cells'][9]);
    }

    public function test_cost_history_calculates_cost_before_and_after(): void
    {
        $warehouse = Warehouse::create(['code' => 'REP-HPP', 'name' => 'Gudang HPP', 'type' => 'main']);
        $item = Item::create(['code' => 'REP-HPP-ITEM', 'name' => 'Item HPP', 'base_uom' => 'PCS']);
        $admin = User::factory()->create();
        StockLedger::create([
            'warehouse_id' => $warehouse->id,
            'item_id' => $item->id,
            'direction' => 'in',
            'qty' => 10,
            'unit_cost' => 1000,
            'balance_qty' => 10,
            'balance_cost' => 1000,
            'created_by' => $admin->id,
            'created_at' => now()->subDay(),
        ]);
        StockLedger::create([
            'warehouse_id' => $warehouse->id,
            'item_id' => $item->id,
            'direction' => 'in',
            'qty' => 10,
            'unit_cost' => 2000,
            'balance_qty' => 20,
            'balance_cost' => 1500,
            'created_by' => $admin->id,
            'created_at' => now(),
        ]);

        $this->actingAs($admin)->get('/reports?report=cost-history&date_from='.now()->subWeek()->format('Y-m-d').'&date_to='.now()->format('Y-m-d'))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->has('data.rows', 2)
                ->where('data.rows.1.cost_before', 1000)
                ->where('data.rows.1.incoming_cost', 2000)
                ->where('data.rows.1.cost_after', 1500)
                ->where('data.rows.1.difference', 500)
                ->where('data.rows.1.percentage', 50));
    }

    public function test_report_can_be_exported_as_pdf_and_excel_with_active_filters(): void
    {
        $warehouse = Warehouse::create(['code' => 'REP-EXP', 'name' => 'Gudang Export', 'type' => 'main']);
        $item = Item::create(['code' => 'EXP-ITEM', 'name' => 'Item Export', 'base_uom' => 'PCS']);
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        $this->ledger($warehouse, $item, $admin, 'in', 7, now());
        $query = 'report=ledger&warehouse_id='.$warehouse->id.'&date_from='.now()->format('Y-m-d').'&date_to='.now()->format('Y-m-d');

        $pdf = $this->actingAs($admin)->get('/reports/export/pdf?'.$query);
        $pdf->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $pdf->getContent());

        $xlsx = $this->actingAs($admin)->get('/reports/export/xlsx?'.$query);
        $xlsx->assertOk()->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $path = tempnam(sys_get_temp_dir(), 'report-test-');
        file_put_contents($path, $xlsx->getContent());
        $zip = new ZipArchive;
        $this->assertTrue($zip->open($path));
        $sheet = $zip->getFromName('xl/worksheets/sheet1.xml');
        $styles = $zip->getFromName('xl/styles.xml');
        $sharedStrings = $zip->getFromName('xl/sharedStrings.xml');
        $zip->close();
        unlink($path);
        $this->assertNotFalse(simplexml_load_string($sheet));
        $this->assertNotFalse(simplexml_load_string($styles));
        $this->assertNotFalse($sharedStrings);
        $this->assertStringContainsString('EXP-ITEM', $sharedStrings);
        $this->assertStringContainsString('Gudang Export', $sharedStrings);
        $this->assertStringContainsString('Subtotal EXP-ITEM - Item Export', $sharedStrings);
        $this->assertStringContainsString('<mergeCell ref="A7:J7"/>', $sheet);
    }

    private function ledger(Warehouse $warehouse, Item $item, User $creator, string $direction, float $qty, $date): void
    {
        StockLedger::create([
            'warehouse_id' => $warehouse->id,
            'item_id' => $item->id,
            'direction' => $direction,
            'qty' => $qty,
            'unit_cost' => 1000,
            'balance_qty' => $direction === 'in' ? $qty : 0,
            'balance_cost' => 1000,
            'created_by' => $creator->id,
            'created_at' => $date,
        ]);
    }
}
