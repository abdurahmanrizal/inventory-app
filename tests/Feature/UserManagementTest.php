<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_superadmin_can_create_update_and_delete_user(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        $warehouse = Warehouse::create(['code' => 'USR-WH', 'name' => 'Gudang User', 'type' => 'unit']);

        $this->actingAs($admin)->post('/user-management', [
            'name' => 'User Baru', 'email' => 'baru@wms.test', 'role' => 'unit_user', 'warehouse_id' => $warehouse->id,
            'password' => 'password123', 'password_confirmation' => 'password123',
        ])->assertRedirect();
        $user = User::where('email', 'baru@wms.test')->firstOrFail();

        $this->actingAs($admin)->put("/user-management/{$user->id}", [
            'name' => 'User Diperbarui', 'email' => 'baru@wms.test', 'role' => 'unit_manager', 'warehouse_id' => $warehouse->id,
            'password' => '', 'password_confirmation' => '',
        ])->assertRedirect();
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'User Diperbarui', 'role' => 'unit_manager']);

        $this->actingAs($admin)->delete("/user-management/{$user->id}")->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    public function test_non_superadmin_cannot_manage_users(): void
    {
        $manager = User::factory()->create(['role' => UserRole::UnitManager]);
        $this->actingAs($manager)->get('/user-management')->assertForbidden();
        $this->actingAs($manager)->post('/user-management', [])->assertForbidden();
        $warehouseAdmin = User::factory()->create(['role' => UserRole::WarehouseAdminDry]);
        $this->actingAs($warehouseAdmin)->post('/user-management', [
            'name' => 'User Ilegal', 'email' => 'ilegal@wms.test', 'role' => 'unit_user',
            'password' => 'password123', 'password_confirmation' => 'password123',
        ])->assertForbidden();
        $this->assertDatabaseMissing('users', ['email' => 'ilegal@wms.test']);
    }

    public function test_superadmin_cannot_delete_own_account(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Superadmin]);
        $this->actingAs($admin)->delete("/user-management/{$admin->id}")->assertSessionHasErrors('user');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    public function test_search_and_role_tabs_filter_users_before_pagination(): void
    {
        $admin = User::factory()->create(['name' => 'Administrator', 'role' => UserRole::Superadmin]);
        $warehouse = Warehouse::create(['code' => 'USR-FILTER', 'name' => 'Gudang Filter', 'type' => 'unit']);
        foreach (range(1, 25) as $index) {
            User::factory()->create([
                'name' => 'Pengguna Umum '.str_pad((string) $index, 2, '0', STR_PAD_LEFT),
                'email' => "umum{$index}@wms.test",
                'role' => UserRole::UnitUser,
                'warehouse_id' => $warehouse->id,
            ]);
        }
        $target = User::factory()->create([
            'name' => 'Pengguna Target Unik',
            'email' => 'target-khusus@wms.test',
            'role' => UserRole::Finance,
        ]);

        $this->actingAs($admin)
            ->get('/user-management?search=target-khusus')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.search', 'target-khusus')
                ->where('filters.role', '')
                ->has('users.data', 1)
                ->where('users.data.0.id', $target->id)
                ->where('users.total', 1)
                ->where('roleCounts.finance', 1));

        $this->actingAs($admin)
            ->get('/user-management?role=finance')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('filters.role', 'finance')
                ->has('users.data', 1)
                ->where('users.data.0.id', $target->id));

        $this->actingAs($admin)
            ->get('/user-management?search=Pengguna&role=unit_user')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->where('users.total', 25)
                ->has('users.data', 20)
                ->where('users.next_page_url', fn ($url) => str_contains($url, 'search=Pengguna') && str_contains($url, 'role=unit_user')));
    }
}
