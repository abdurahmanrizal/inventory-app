<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->foreignId('stock_cost_layer_id')->nullable()->after('stock_transaction_id')
                ->constrained('stock_cost_layers')->nullOnDelete();
            $table->decimal('cost_layer_balance_qty', 18, 3)->nullable()->after('stock_cost_layer_id');
        });
    }

    public function down(): void
    {
        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('stock_cost_layer_id');
            $table->dropColumn('cost_layer_balance_qty');
        });
    }
};
