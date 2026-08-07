<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_adjustments', function (Blueprint $table) {
            $table->enum('valuation_method', ['moving_average', 'fifo'])->default('moving_average')->after('type');
        });

        $method = DB::table('inventory_settings')->value('valuation_method') ?? 'moving_average';
        DB::table('stock_adjustments')->update(['valuation_method' => $method]);
    }

    public function down(): void
    {
        Schema::table('stock_adjustments', function (Blueprint $table) {
            $table->dropColumn('valuation_method');
        });
    }
};
