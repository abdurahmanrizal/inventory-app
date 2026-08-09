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

class FinanceRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_finance_has_company_wide_read_only_inventory_access(): void
    {
        $first = Warehouse::create(['code' => 'FIN-WH-1', 'name' => 'Gudang Finance 1', 'type' => 'main']);
        $second = Warehouse::create(['code' => 'FIN-WH-2', 'name' => 'Gudang Finance 2', 'type' => 'unit', 'main_warehouse_id' => $first->id]);
        $item = Item::create(['code' => 'FIN-ITEM', 'name' => 'Item Finance', 'base_uom' => 'PCS']);
        CurrentStock::create(['warehouse_id' => $first->id, 'item_id' => $item->id, 'qty_on_hand' => 10, 'average_cost' => 100]);
        CurrentStock::create(['warehouse_id' => $second->id, 'item_id' => $item->id, 'qty_on_hand' => 5, 'average_cost' => 150]);
        $finance = User::factory()->create(['role' => UserRole::Finance, 'warehouse_id' => null]);

        $this->actingAs($finance)->get('/dashboard')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('financeSummary.inventoryValue', 1750)
            ->where('financeSummary.valuationMethod', 'moving_average')
            ->has('financeSummary.warehouseValues', 2));
        $this->actingAs($finance)->get('/warehouse-stocks')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('canViewAll', true)
            ->where('canFilterWarehouse', true)
            ->has('stocks', 2));
        $this->actingAs($finance)->get('/reports?report=valuation')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('canFilterWarehouse', true));
        $this->actingAs($finance)->get('/reports/export/xlsx?report=valuation')->assertOk();
        $this->actingAs($finance)->get('/transaction-activities')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('canFilterWarehouse', true));

        $this->actingAs($finance)->post('/operations/inventory-control/adjustments', [])->assertForbidden();
        $this->actingAs($finance)->post('/stock-transactions', [])->assertForbidden();
        $this->actingAs($finance)->get('/approvals')->assertForbidden();
    }

    public function test_superadmin_can_create_finance_user_without_warehouse(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);

        $this->actingAs($admin)->post('/user-management', [
            'name' => 'Finance User',
            'email' => 'finance@example.test',
            'role' => 'finance',
            'warehouse_id' => null,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertRedirect();

        $this->assertDatabaseHas('users', ['email' => 'finance@example.test', 'role' => 'finance', 'warehouse_id' => null]);
    }
}
