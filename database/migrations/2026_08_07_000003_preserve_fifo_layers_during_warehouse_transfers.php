<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('stock_cost_layers', 'source_cost_layer_id')) {
            Schema::table('stock_cost_layers', function (Blueprint $table) {
                $table->foreignId('source_cost_layer_id')->nullable()->after('id')
                    ->constrained('stock_cost_layers')->nullOnDelete();
            });
        }

        if (! Schema::hasTable('stock_transfer_layer_allocations')) {
            Schema::create('stock_transfer_layer_allocations', function (Blueprint $table) {
                $table->id();
                $table->foreignId('delivery_detail_id')->constrained()->cascadeOnDelete();
                $table->foreignId('source_cost_layer_id')->nullable()->constrained('stock_cost_layers')->nullOnDelete();
                $table->string('batch_no')->nullable();
                $table->date('expired_at')->nullable();
                $table->timestamp('source_received_at')->nullable();
                $table->decimal('qty_allocated', 18, 3);
                $table->decimal('qty_received', 18, 3)->default(0);
                $table->decimal('unit_cost', 18, 2);
                $table->timestamps();
                $table->index(['delivery_detail_id', 'qty_received'], 'transfer_layer_receipt_idx');
            });
        } else {
            Schema::table('stock_transfer_layer_allocations', function (Blueprint $table) {
                $table->index(['delivery_detail_id', 'qty_received'], 'transfer_layer_receipt_idx');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_transfer_layer_allocations');
        Schema::table('stock_cost_layers', function (Blueprint $table) {
            $table->dropConstrainedForeignId('source_cost_layer_id');
        });
    }
};
