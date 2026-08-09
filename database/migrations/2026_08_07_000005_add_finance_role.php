<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['superadmin', 'warehouse_admin_dry', 'warehouse_admin_wet', 'unit_user', 'unit_manager', 'finance'])
                ->default('superadmin')->change();
        });

        DB::table('roles')->updateOrInsert(
            ['code' => 'finance'],
            ['name' => 'Keuangan', 'description' => 'Akses read-only data dan laporan keuangan persediaan', 'created_at' => now(), 'updated_at' => now()],
        );

        $roleId = DB::table('roles')->where('code', 'finance')->value('id');
        DB::table('permissions')->whereIn('code', ['stock.view', 'report.view', 'activity.view'])
            ->pluck('id')
            ->each(fn (int $permissionId) => DB::table('role_permissions')->insertOrIgnore([
                'role_id' => $roleId,
                'permission_id' => $permissionId,
            ]));
    }

    public function down(): void
    {
        $roleId = DB::table('roles')->where('code', 'finance')->value('id');
        if ($roleId) {
            DB::table('role_permissions')->where('role_id', $roleId)->delete();
            DB::table('role_user')->where('role_id', $roleId)->delete();
            DB::table('roles')->where('id', $roleId)->delete();
        }

        DB::table('users')->where('role', 'finance')->update(['role' => 'superadmin']);
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['superadmin', 'warehouse_admin_dry', 'warehouse_admin_wet', 'unit_user', 'unit_manager'])
                ->default('superadmin')->change();
        });
    }
};
