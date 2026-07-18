<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id(); $table->string('code')->unique(); $table->string('name'); $table->timestamps();
        });
        Schema::create('warehouses', function (Blueprint $table) {
            $table->id(); $table->string('code')->unique(); $table->string('name');
            $table->enum('type', ['main','unit']); $table->foreignId('main_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->boolean('is_active')->default(true); $table->timestamps();
        });
        Schema::create('items', function (Blueprint $table) {
            $table->id(); $table->string('code')->unique(); $table->string('name');
            $table->foreignId('category_id')->nullable()->constrained()->nullOnDelete();
            $table->string('base_uom', 20); $table->enum('warehouse_type', ['dry','wet','both'])->default('dry');
            $table->enum('valuation_method', ['moving_average'])->default('moving_average');
            $table->decimal('min_stock', 18, 3)->default(0); $table->boolean('is_active')->default(true); $table->timestamps();
        });
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id(); $table->string('number')->unique();
            $table->enum('type', ['stock_in','stock_out','transfer','opname','adjustment']);
            $table->foreignId('source_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->foreignId('destination_warehouse_id')->nullable()->constrained('warehouses')->nullOnDelete();
            $table->string('supplier_name')->nullable(); $table->date('document_date');
            $table->enum('status', ['draft','waiting_approval','approved','rejected','completed','cancelled'])->default('draft');
            $table->text('notes')->nullable(); $table->foreignId('created_by')->constrained('users');
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable(); $table->timestamp('posted_at')->nullable(); $table->timestamps();
            $table->index(['type','status','document_date']);
        });
        Schema::create('stock_transaction_details', function (Blueprint $table) {
            $table->id(); $table->foreignId('stock_transaction_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained(); $table->decimal('qty',18,3); $table->decimal('unit_cost',18,2)->default(0);
            $table->string('batch_no')->nullable(); $table->date('expired_at')->nullable(); $table->text('notes')->nullable(); $table->timestamps();
        });
        Schema::create('current_stocks', function (Blueprint $table) {
            $table->id(); $table->foreignId('warehouse_id')->constrained(); $table->foreignId('item_id')->constrained();
            $table->string('batch_no')->nullable(); $table->date('expired_at')->nullable();
            $table->decimal('qty_on_hand',18,3)->default(0); $table->decimal('qty_reserved',18,3)->default(0); $table->decimal('average_cost',18,2)->default(0); $table->timestamps();
            $table->unique(['warehouse_id','item_id','batch_no']);
        });
        Schema::create('stock_ledgers', function (Blueprint $table) {
            $table->id(); $table->foreignId('stock_transaction_id')->constrained(); $table->foreignId('warehouse_id')->constrained();
            $table->foreignId('item_id')->constrained(); $table->string('batch_no')->nullable(); $table->date('expired_at')->nullable();
            $table->enum('direction',['in','out']); $table->decimal('qty',18,3); $table->decimal('unit_cost',18,2);
            $table->decimal('balance_qty',18,3); $table->decimal('balance_cost',18,2); $table->foreignId('created_by')->constrained('users');
            $table->timestamp('created_at'); $table->index(['warehouse_id','item_id','created_at']);
        });
        Schema::create('approvals', function (Blueprint $table) {
            $table->id(); $table->foreignId('stock_transaction_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('level')->default(1); $table->foreignId('approver_id')->constrained('users');
            $table->enum('status',['pending','approved','rejected']); $table->text('remarks')->nullable(); $table->timestamp('acted_at')->nullable(); $table->timestamps();
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('approvals'); Schema::dropIfExists('stock_ledgers'); Schema::dropIfExists('current_stocks');
        Schema::dropIfExists('stock_transaction_details'); Schema::dropIfExists('stock_transactions'); Schema::dropIfExists('items'); Schema::dropIfExists('warehouses'); Schema::dropIfExists('categories');
    }
};
