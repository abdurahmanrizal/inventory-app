<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
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
}
