<?php

namespace Tests\Feature;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Item;
use App\Models\StockRequest;
use App\Models\StockTransaction;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_are_redirected_to_the_login_page()
    {
        $response = $this->get(route('dashboard'));
        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_users_can_visit_the_dashboard()
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $response = $this->get(route('dashboard'));
        $response->assertOk();
    }

    public function test_unit_dashboard_only_contains_own_unit_related_data(): void
    {
        $dry = Warehouse::create(['code' => 'DASH-DRY', 'name' => 'Gudang Utama Kering', 'type' => 'main']);
        $own = Warehouse::create(['code' => 'DASH-OWN', 'name' => 'Unit Sendiri', 'type' => 'unit', 'main_warehouse_id' => $dry->id]);
        $other = Warehouse::create(['code' => 'DASH-OTHER', 'name' => 'Unit Lain', 'type' => 'unit', 'main_warehouse_id' => $dry->id]);
        $item = Item::create(['code' => 'DASH-ITEM', 'name' => 'Item Dashboard', 'base_uom' => 'PCS']);
        CurrentStock::create(['warehouse_id' => $own->id, 'item_id' => $item->id, 'qty_on_hand' => 5, 'average_cost' => 1000]);
        CurrentStock::create(['warehouse_id' => $other->id, 'item_id' => $item->id, 'qty_on_hand' => 50, 'average_cost' => 2000]);
        $user = User::factory()->create(['role' => UserRole::UnitUser, 'warehouse_id' => $own->id]);

        StockTransaction::create([
            'number' => 'DASH-OWN-TX', 'type' => TransactionType::StockOut,
            'source_warehouse_id' => $own->id, 'document_date' => now(),
            'status' => TransactionStatus::WaitingApproval, 'created_by' => $user->id,
        ]);
        StockTransaction::create([
            'number' => 'DASH-OTHER-TX', 'type' => TransactionType::StockOut,
            'source_warehouse_id' => $other->id, 'document_date' => now(),
            'status' => TransactionStatus::WaitingApproval, 'created_by' => $user->id,
        ]);
        StockRequest::create([
            'number' => 'DASH-OWN-REQ', 'type' => 'to_unit',
            'from_warehouse_id' => $dry->id, 'to_warehouse_id' => $own->id,
            'request_date' => now(), 'status' => 'waiting_approval', 'requested_by' => $user->id,
        ]);
        StockRequest::create([
            'number' => 'DASH-OTHER-REQ', 'type' => 'to_unit',
            'from_warehouse_id' => $dry->id, 'to_warehouse_id' => $other->id,
            'request_date' => now(), 'status' => 'waiting_approval', 'requested_by' => $user->id,
        ]);

        $this->actingAs($user)->get(route('dashboard'))->assertOk()->assertInertia(fn (AssertableInertia $page) => $page
            ->where('stats.stockQty', 5)
            ->where('stats.stockValue', 5000)
            ->where('stats.pendingApproval', 2)
            ->has('recent', 2)
            ->where('scopeLabel', 'Transaksi dan persediaan Unit Sendiri')
            ->where('quickActions.stockIn', false)
            ->where('quickActions.stockRequest', true));
    }
}
