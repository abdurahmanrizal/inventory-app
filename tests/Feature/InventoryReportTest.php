<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Item;
use App\Models\StockLedger;
use App\Models\User;
use App\Models\Warehouse;
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

        foreach (['ledger', 'slow-moving', 'opname', 'valuation', 'cost-history'] as $report) {
            $this->actingAs($admin)->get('/reports?report='.$report)
                ->assertOk()
                ->assertInertia(fn (Assert $page) => $page
                    ->component('Reports/Index')
                    ->where('report', $report));
        }
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
        $this->assertStringContainsString('<mergeCell ref="A7:I7"/>', $sheet);
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
