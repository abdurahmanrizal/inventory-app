<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('workflow_approval_steps', function (Blueprint $table) {
            $table->string('stage_key')->nullable()->after('level');
            $table->string('stage_label')->nullable()->after('stage_key');
            $table->foreignId('acted_by')->nullable()->after('approver_id')->constrained('users')->nullOnDelete();
        });

        $permissionId = DB::table('permissions')->where('code', 'approval.act')->value('id');
        if ($permissionId) {
            DB::table('roles')->whereIn('code', ['warehouse_admin_dry', 'warehouse_admin_wet'])
                ->pluck('id')->each(fn (int $roleId) => DB::table('role_permissions')->insertOrIgnore([
                    'role_id' => $roleId, 'permission_id' => $permissionId,
                ]));
        }
    }

    public function down(): void
    {
        $permissionId = DB::table('permissions')->where('code', 'approval.act')->value('id');
        if ($permissionId) {
            $roleIds = DB::table('roles')->whereIn('code', ['warehouse_admin_dry', 'warehouse_admin_wet'])->pluck('id');
            DB::table('role_permissions')->whereIn('role_id', $roleIds)->where('permission_id', $permissionId)->delete();
        }

        Schema::table('workflow_approval_steps', function (Blueprint $table) {
            $table->dropConstrainedForeignId('acted_by');
            $table->dropColumn(['stage_key', 'stage_label']);
        });
    }
};
