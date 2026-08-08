<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->enum('request_kind', ['supplier_receipt', 'unit_request', 'unit_return'])->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->enum('request_kind', ['supplier_receipt', 'unit_request'])->nullable()->change();
        });
    }
};
