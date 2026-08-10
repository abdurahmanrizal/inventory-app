<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Item;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class WarehouseManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_create_update_search_and_filter_warehouses(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);

        $this->actingAs($admin)->post('/warehouse-management', [
            'code' => 'wh-new-wet',
            'name' => 'Gudang Utama Basah Baru',
            'type' => 'main',
            'inventory_type' => 'wet',
            'main_warehouse_id' => null,
            'is_active' => true,
        ])->assertRedirect();
        $main = Warehouse::where('code', 'WH-NEW-WET')->firstOrFail();

        $this->actingAs($admin)->post('/warehouse-management', [
            'code' => 'unit-wet-new',
            'name' => 'Unit Basah Baru',
            'type' => 'unit',
            'inventory_type' => null,
            'main_warehouse_id' => $main->id,
            'is_active' => true,
        ])->assertRedirect();
        $unit = Warehouse::where('code', 'UNIT-WET-NEW')->firstOrFail();

        $this->actingAs($admin)->get('/warehouse-management?search=Unit%20Basah&filter=wet')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('WarehouseManagement/Index')
                ->where('filters.search', 'Unit Basah')
                ->where('filters.filter', 'wet')
                ->has('warehouses.data', 1)
                ->where('warehouses.data.0.id', $unit->id)
                ->where('warehouses.data.0.main_warehouse.inventory_type', 'wet'));

        $this->actingAs($admin)->put('/warehouse-management/'.$unit->id, [
            'code' => 'UNIT-WET-EDITED',
            'name' => 'Unit Basah Diperbarui',
            'type' => 'unit',
            'inventory_type' => null,
            'main_warehouse_id' => $main->id,
            'is_active' => false,
        ])->assertRedirect();
        $this->assertDatabaseHas('warehouses', ['id' => $unit->id, 'code' => 'UNIT-WET-EDITED', 'is_active' => false]);
    }

    public function test_unit_requires_main_warehouse_and_used_warehouse_cannot_be_deleted(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        $main = Warehouse::create(['code' => 'WH-USED', 'name' => 'Gudang Digunakan', 'type' => 'main', 'inventory_type' => 'dry']);

        $this->actingAs($admin)->post('/warehouse-management', [
            'code' => 'UNIT-NO-MAIN', 'name' => 'Unit Tanpa Utama', 'type' => 'unit',
            'inventory_type' => null, 'main_warehouse_id' => null, 'is_active' => true,
        ])->assertSessionHasErrors('main_warehouse_id');

        $item = Item::create(['code' => 'WH-USED-ITEM', 'name' => 'Item', 'base_uom' => 'PCS']);
        CurrentStock::create(['warehouse_id' => $main->id, 'item_id' => $item->id, 'qty_on_hand' => 1]);
        $this->actingAs($admin)->delete('/warehouse-management/'.$main->id)
            ->assertSessionHasErrors('warehouse');
        $this->assertDatabaseHas('warehouses', ['id' => $main->id]);
    }

    public function test_non_superadmin_cannot_access_warehouse_management(): void
    {
        $user = User::factory()->create(['role' => UserRole::WarehouseManager]);
        $this->actingAs($user)->get('/warehouse-management')->assertForbidden();
        $this->actingAs($user)->post('/warehouse-management', [])->assertForbidden();
    }
}
