<?php

namespace Tests\Feature;

use App\Models\CurrentStock;
use App\Models\Item;
use App\Models\Location;
use App\Models\StockLedger;
use App\Models\Supplier;
use App\Models\Uom;
use App\Models\User;
use App\Models\Warehouse;
use Database\Seeders\DatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class DatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_minimal_seeder_is_complete_and_idempotent(): void
    {
        $this->seed(DatabaseSeeder::class);
        $this->seed(DatabaseSeeder::class);

        $this->assertSame(5, Warehouse::count());
        $this->assertSame(11, User::where('email', 'like', '%@wms.test')->count());
        $this->assertSame(5, Item::count());
        $this->assertSame(['GR', 'KG', 'LTR'], Uom::orderBy('code')->pluck('code')->all());
        $this->assertSame(5, DB::table('item_uoms')->count());

        $this->assertSame(0, Supplier::count());
        $this->assertSame(0, Location::count());
        $this->assertSame(0, CurrentStock::count());
        $this->assertSame(0, StockLedger::count());
        $this->assertDatabaseHas('items', ['code' => 'BRG-WET-003', 'base_uom' => 'LTR', 'reorder_point' => 0]);
    }
}
