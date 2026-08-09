<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_settings', function (Blueprint $table) {
            $table->id();
            $table->enum('valuation_method', ['moving_average', 'fifo'])->default('moving_average');
            $table->timestamp('locked_at')->nullable();
            $table->timestamps();
        });

        DB::table('inventory_settings')->insert([
            'id' => 1,
            'valuation_method' => 'moving_average',
            'locked_at' => DB::table('stock_ledgers')->exists() ? now() : null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::create('stock_cost_layers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained();
            $table->foreignId('item_id')->constrained();
            $table->string('batch_no')->nullable();
            $table->date('expired_at')->nullable();
            $table->timestamp('received_at');
            $table->decimal('original_qty', 18, 3);
            $table->decimal('remaining_qty', 18, 3);
            $table->decimal('unit_cost', 18, 2);
            $table->string('reference_type')->nullable();
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->timestamps();
            $table->index(['warehouse_id', 'item_id', 'remaining_qty']);
            $table->index(['reference_type', 'reference_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stock_cost_layers');
        Schema::dropIfExists('inventory_settings');
    }
};
