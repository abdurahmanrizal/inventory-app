<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->enum('stock_out_reason', ['operational', 'shrinkage', 'expired', 'damaged', 'waste', 'return', 'other'])->nullable()->after('request_kind');
        });
    }

    public function down(): void
    {
        Schema::table('stock_transactions', fn (Blueprint $table) => $table->dropColumn('stock_out_reason'));
    }
};
