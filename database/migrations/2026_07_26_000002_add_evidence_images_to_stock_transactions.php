<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->string('receipt_image_path')->nullable()->after('supplier_name');
            $table->string('payment_proof_image_path')->nullable()->after('receipt_image_path');
        });
    }

    public function down(): void
    {
        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->dropColumn(['receipt_image_path', 'payment_proof_image_path']);
        });
    }
};
