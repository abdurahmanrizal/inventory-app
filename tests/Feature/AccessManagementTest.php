<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class AccessManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_superadmin_can_manage_role_permissions(): void
    {
        $superadmin = User::factory()->create(['role' => UserRole::Superadmin]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager]);

        $this->actingAs($manager)->get('/access-management')->assertForbidden();
        $this->actingAs($superadmin)->get('/access-management')->assertOk();
        $this->actingAs($manager)->get('/role-management')->assertForbidden();
        $this->actingAs($manager)->get('/permission-management')->assertForbidden();
        $this->actingAs($superadmin)->get('/role-management')->assertOk();
        $this->actingAs($superadmin)->get('/permission-management')->assertOk();

        $roleId = DB::table('roles')->where('code', UserRole::UnitManager->value)->value('id');
        $this->actingAs($manager)->put("/access-management/{$roleId}", ['permissions' => []])->assertForbidden();
        $this->actingAs($superadmin)->put("/access-management/{$roleId}", ['permissions' => ['stock.view']])->assertRedirect();

        $this->assertTrue($manager->fresh()->hasPermission('stock.view'));
        $this->assertFalse($manager->fresh()->hasPermission('approval.act'));
    }

    public function test_permission_is_enforced_on_protected_module(): void
    {
        $superadmin = User::factory()->create(['role' => UserRole::Superadmin]);
        $warehouse = Warehouse::create(['code' => 'ACCESS-WH', 'name' => 'Gudang Access', 'type' => 'unit']);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $warehouse->id]);
        $this->actingAs($superadmin)->get('/access-management')->assertOk();
        $roleId = DB::table('roles')->where('code', UserRole::UnitManager->value)->value('id');

        $this->actingAs($superadmin)->put("/access-management/{$roleId}", ['permissions' => []])->assertRedirect();
        $this->actingAs($manager)->get('/warehouse-stocks')->assertForbidden();

        $this->actingAs($superadmin)->put("/access-management/{$roleId}", ['permissions' => ['stock.view']])->assertRedirect();
        $this->actingAs($manager)->get('/warehouse-stocks')->assertOk();
    }

    public function test_superadmin_can_create_update_and_delete_custom_roles_and_permissions(): void
    {
        $superadmin = User::factory()->create(['role' => UserRole::Superadmin]);

        $this->actingAs($superadmin)->post('/access-management/roles', [
            'code' => 'stock_auditor',
            'name' => 'Stock Auditor',
            'description' => 'Mengaudit persediaan',
        ])->assertRedirect();
        $roleId = DB::table('roles')->where('code', 'stock_auditor')->value('id');
        $this->assertNotNull($roleId);

        $this->actingAs($superadmin)->post('/access-management/permissions', [
            'code' => 'report.export',
            'name' => 'Ekspor Laporan',
            'module' => 'Laporan',
        ])->assertRedirect();
        $permissionId = DB::table('permissions')->where('code', 'report.export')->value('id');
        $this->assertNotNull($permissionId);

        $this->actingAs($superadmin)->put("/access-management/{$roleId}", [
            'permissions' => ['report.export'],
        ])->assertRedirect();
        $this->assertDatabaseHas('role_permissions', ['role_id' => $roleId, 'permission_id' => $permissionId]);

        $this->actingAs($superadmin)->put("/access-management/roles/{$roleId}", [
            'code' => 'stock_auditor',
            'name' => 'Auditor Persediaan',
            'description' => 'Audit stok berkala',
        ])->assertRedirect();
        $this->actingAs($superadmin)->put("/access-management/permissions/{$permissionId}", [
            'code' => 'report.export',
            'name' => 'Unduh Laporan',
            'module' => 'Pelaporan',
        ])->assertRedirect();
        $this->assertDatabaseHas('roles', ['id' => $roleId, 'name' => 'Auditor Persediaan']);
        $this->assertDatabaseHas('permissions', ['id' => $permissionId, 'name' => 'Unduh Laporan']);

        $this->actingAs($superadmin)->delete("/access-management/permissions/{$permissionId}")->assertRedirect();
        $this->actingAs($superadmin)->delete("/access-management/roles/{$roleId}")->assertRedirect();
        $this->assertDatabaseMissing('permissions', ['id' => $permissionId]);
        $this->assertDatabaseMissing('roles', ['id' => $roleId]);
    }

    public function test_non_superadmin_cannot_mutate_roles_or_permissions(): void
    {
        $manager = User::factory()->create(['role' => UserRole::UnitManager]);

        $this->actingAs($manager)->post('/access-management/roles', [
            'code' => 'forbidden_role', 'name' => 'Forbidden',
        ])->assertForbidden();
        $this->actingAs($manager)->post('/access-management/permissions', [
            'code' => 'forbidden.action', 'name' => 'Forbidden', 'module' => 'Test',
        ])->assertForbidden();
    }

    public function test_system_role_cannot_be_deleted(): void
    {
        $superadmin = User::factory()->create(['role' => UserRole::Superadmin]);
        $this->actingAs($superadmin)->get('/access-management')->assertOk();
        $roleId = DB::table('roles')->where('code', UserRole::UnitManager->value)->value('id');

        $this->actingAs($superadmin)->delete("/access-management/roles/{$roleId}")
            ->assertSessionHasErrors('role');
        $this->assertDatabaseHas('roles', ['id' => $roleId]);
    }
}
