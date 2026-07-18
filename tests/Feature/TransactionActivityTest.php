<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Item;
use App\Models\StockLedger;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class TransactionActivityTest extends TestCase
{
    use RefreshDatabase;

    public function test_manager_only_sees_activity_from_assigned_warehouse(): void
    {
        $own = Warehouse::create(['code' => 'ACT-OWN', 'name' => 'Unit Sendiri', 'type' => 'unit']);
        $other = Warehouse::create(['code' => 'ACT-OTHER', 'name' => 'Unit Lain', 'type' => 'unit']);
        $item = Item::create(['code' => 'ACT-ITEM', 'name' => 'Item Aktivitas', 'base_uom' => 'PCS']);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $own->id]);
        $creator = User::factory()->create();
        $this->ledger($own, $item, $creator, 5);
        $this->ledger($other, $item, $creator, 9);

        $this->actingAs($manager)->get('/transaction-activities')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('TransactionActivity/Index')->has('activities.data', 1)
            ->where('activities.data.0.warehouse.id', $own->id)->where('summary.qtyIn', 5));
    }

    public function test_superadmin_can_filter_activity_by_warehouse(): void
    {
        $first = Warehouse::create(['code' => 'ACT-A', 'name' => 'Gudang A', 'type' => 'main']);
        $second = Warehouse::create(['code' => 'ACT-B', 'name' => 'Gudang B', 'type' => 'main']);
        $item = Item::create(['code' => 'ACT-FILTER', 'name' => 'Item Filter', 'base_uom' => 'PCS']);
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        $this->ledger($first, $item, $admin, 3);
        $this->ledger($second, $item, $admin, 7);

        $this->actingAs($admin)->get('/transaction-activities?warehouse_id='.$second->id)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('canFilterWarehouse', true)->has('activities.data', 1)
            ->where('activities.data.0.warehouse.id', $second->id)->where('summary.qtyIn', 7));
    }

    public function test_non_manager_cannot_access_transaction_activity(): void
    {
        $user = User::factory()->create(['role' => UserRole::UnitUser]);
        $this->actingAs($user)->get('/transaction-activities')->assertForbidden();
    }

    private function ledger(Warehouse $warehouse, Item $item, User $creator, float $qty): void
    {
        StockLedger::create(['reference_type' => 'adjustment', 'reference_id' => 1, 'warehouse_id' => $warehouse->id, 'item_id' => $item->id, 'direction' => 'in', 'qty' => $qty, 'unit_cost' => 1000, 'balance_qty' => $qty, 'balance_cost' => 1000, 'created_by' => $creator->id, 'created_at' => now()]);
    }
}
