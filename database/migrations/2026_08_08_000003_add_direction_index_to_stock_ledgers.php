<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->index(['warehouse_id', 'item_id', 'created_at', 'direction'], 'ledger_wh_item_date_dir_index');
        });
    }

    public function down(): void
    {
        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->dropIndex('ledger_wh_item_date_dir_index');
        });
    }
};
