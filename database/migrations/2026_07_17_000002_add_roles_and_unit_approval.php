<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['superadmin', 'warehouse_admin_dry', 'warehouse_admin_wet', 'unit_user', 'unit_manager'])->default('superadmin')->after('email');
            $table->foreignId('warehouse_id')->nullable()->after('role')->constrained('warehouses')->nullOnDelete();
        });

        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->enum('request_kind', ['supplier_receipt', 'unit_request'])->nullable()->after('type');
            $table->foreignId('assigned_approver_id')->nullable()->after('created_by')->constrained('users')->nullOnDelete();
            $table->index(['request_kind', 'assigned_approver_id', 'status'], 'stock_tx_request_approver_status_idx');
        });
    }

    public function down(): void
    {
        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->dropIndex('stock_tx_request_approver_status_idx');
            $table->dropConstrainedForeignId('assigned_approver_id');
            $table->dropColumn('request_kind');
        });
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('warehouse_id');
            $table->dropColumn('role');
        });
    }
};
