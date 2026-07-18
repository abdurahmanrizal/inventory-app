<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\StockLedger;
use App\Models\StockTransaction;
use App\Models\User;
use App\Models\Warehouse;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_business_flow_seeder_is_complete_and_idempotent(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(5, Warehouse::count());
        $this->assertSame(11, User::where('email', 'like', '%@wms.test')->count());
        $this->assertSame(16, CurrentStock::count());
        $this->assertSame(32, StockLedger::count());
        $this->assertSame(4, StockTransaction::whereIn('number', [
            'REQ-CAFE-DEMO-001', 'REQ-KITCHEN-DEMO-001', 'STOCK-IN-DEMO-001', 'STOCK-IN-WET-DEMO-001',
        ])->count());

        $manager = User::where('email', 'manager.cafe@wms.test')->firstOrFail();
        $request = StockTransaction::where('number', 'REQ-CAFE-DEMO-001')->firstOrFail();
        $this->assertSame(UserRole::UnitManager, $manager->role);
        $this->assertSame($manager->id, $request->assigned_approver_id);
        $this->assertSame(2, $request->details()->count());

        $dryManager = User::where('email', 'manager.kering@wms.test')->firstOrFail();
        $dryReceipt = StockTransaction::where('number', 'STOCK-IN-DEMO-001')->firstOrFail();
        $this->assertSame(UserRole::UnitManager, $dryManager->role);
        $this->assertSame($dryManager->id, $dryReceipt->assigned_approver_id);

        $unitWarehouses = Warehouse::where('type', 'unit')->get();
        $this->assertCount(3, $unitWarehouses);
        foreach ($unitWarehouses as $warehouse) {
            $stocks = CurrentStock::where('warehouse_id', $warehouse->id)->get();
            $this->assertNotEmpty($stocks, "Gudang {$warehouse->name} harus memiliki saldo awal.");
            $this->assertTrue($stocks->every(fn (CurrentStock $stock) => (float) $stock->qty_on_hand > 0));
            $this->assertTrue($stocks->every(fn (CurrentStock $stock) => (float) $stock->average_cost > 0), "Seluruh stok {$warehouse->name} harus memiliki HPP.");
            $this->assertTrue($stocks->every(fn (CurrentStock $stock) => $stock->location_id !== null && $stock->uom_id !== null));
            $this->assertTrue(StockLedger::where('warehouse_id', $warehouse->id)->where('reference_type', 'opening')->exists());
            $this->assertTrue(StockLedger::where('warehouse_id', $warehouse->id)->where('direction', 'out')->exists());
        }
    }
}
