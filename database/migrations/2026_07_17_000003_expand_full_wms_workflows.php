<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('categories', function (Blueprint $table) {
            $table->foreignId('parent_id')->nullable()->after('name')->constrained('categories')->nullOnDelete();
            $table->boolean('is_active')->default(true)->after('parent_id');
        });
        Schema::table('items', function (Blueprint $table) {
            $table->boolean('has_batch')->default(false)->after('warehouse_type');
            $table->boolean('has_expired')->default(false)->after('has_batch');
            $table->decimal('reorder_point', 18, 3)->default(0)->after('min_stock');
            $table->enum('issue_method', ['manual', 'fifo', 'fefo'])->default('manual')->after('valuation_method');
        });

        Schema::create('uoms', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();
            $table->string('name');
            $table->enum('type', ['base', 'small'])->default('base');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('item_uoms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('uom_id')->constrained();
            $table->decimal('conversion_factor', 18, 6)->default(1);
            $table->boolean('is_base')->default(false);
            $table->timestamps();
            $table->unique(['item_id', 'uom_id']);
        });
        Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('warehouse_id')->constrained()->cascadeOnDelete();
            $table->string('code');
            $table->string('name');
            $table->enum('type', ['zone', 'rack', 'bin']);
            $table->foreignId('parent_id')->nullable()->constrained('locations')->nullOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['warehouse_id', 'code']);
        });

        Schema::create('purchase_orders', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('supplier_id')->constrained();
            $table->foreignId('warehouse_id')->constrained();
            $table->date('order_date');
            $table->date('expected_date')->nullable();
            $table->enum('status', ['draft', 'waiting_approval', 'approved', 'partial', 'completed', 'cancelled', 'rejected'])->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('assigned_approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('purchase_order_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_order_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained();
            $table->foreignId('uom_id')->nullable()->constrained();
            $table->decimal('qty_ordered', 18, 3);
            $table->decimal('qty_received', 18, 3)->default(0);
            $table->decimal('unit_price', 18, 2);
            $table->timestamps();
        });
        Schema::create('goods_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('purchase_order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('supplier_id')->constrained();
            $table->foreignId('warehouse_id')->constrained();
            $table->date('receipt_date');
            $table->enum('status', ['draft', 'waiting_approval', 'approved', 'rejected', 'posted'])->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('received_by')->constrained('users');
            $table->foreignId('assigned_approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
        });
        Schema::create('goods_receipt_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_receipt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('purchase_order_detail_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('item_id')->constrained();
            $table->foreignId('uom_id')->nullable()->constrained();
            $table->decimal('qty_received', 18, 3);
            $table->decimal('unit_price', 18, 2);
            $table->string('batch_no')->nullable();
            $table->date('expired_at')->nullable();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('stock_requests', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->enum('type', ['to_unit', 'transfer', 'withdrawal'])->default('to_unit');
            $table->foreignId('from_warehouse_id')->constrained('warehouses');
            $table->foreignId('to_warehouse_id')->constrained('warehouses');
            $table->date('request_date');
            $table->enum('status', ['draft', 'waiting_approval', 'approved', 'delivering', 'partial', 'received', 'rejected', 'cancelled'])->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('requested_by')->constrained('users');
            $table->foreignId('assigned_approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('stock_request_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_request_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained();
            $table->foreignId('uom_id')->nullable()->constrained();
            $table->decimal('qty_requested', 18, 3);
            $table->decimal('qty_approved', 18, 3)->default(0);
            $table->decimal('qty_delivered', 18, 3)->default(0);
            $table->decimal('qty_received', 18, 3)->default(0);
            $table->string('batch_no')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
        Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('stock_request_id')->constrained()->cascadeOnDelete();
            $table->date('delivery_date');
            $table->enum('status', ['draft', 'shipped', 'partial', 'received', 'cancelled'])->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('delivered_by')->constrained('users');
            $table->timestamps();
        });
        Schema::create('delivery_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('delivery_id')->constrained()->cascadeOnDelete();
            $table->foreignId('stock_request_detail_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained();
            $table->foreignId('uom_id')->nullable()->constrained();
            $table->decimal('qty_delivered', 18, 3);
            $table->string('batch_no')->nullable();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('stock_receipts', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('delivery_id')->constrained()->cascadeOnDelete();
            $table->date('receipt_date');
            $table->enum('status', ['received', 'partial', 'rejected'])->default('received');
            $table->text('notes')->nullable();
            $table->foreignId('received_by')->constrained('users');
            $table->timestamps();
        });
        Schema::create('stock_receipt_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_receipt_id')->constrained()->cascadeOnDelete();
            $table->foreignId('delivery_detail_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained();
            $table->foreignId('uom_id')->nullable()->constrained();
            $table->decimal('qty_received', 18, 3);
            $table->decimal('qty_damaged', 18, 3)->default(0);
            $table->string('batch_no')->nullable();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_opnames', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('warehouse_id')->constrained();
            $table->date('opname_date');
            $table->enum('status', ['draft', 'in_progress', 'waiting_approval', 'approved', 'rejected', 'posted'])->default('draft');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('assigned_approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
        Schema::create('stock_opname_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_opname_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained();
            $table->foreignId('uom_id')->nullable()->constrained();
            $table->string('batch_no')->nullable();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('system_qty', 18, 3);
            $table->decimal('count_qty', 18, 3);
            $table->decimal('diff_qty', 18, 3);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
        Schema::create('stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->string('number')->unique();
            $table->foreignId('stock_opname_id')->nullable()->constrained()->nullOnDelete();
            $table->enum('type', ['opname', 'damaged', 'expired', 'correction', 'opening', 'waste', 'return'])->default('correction');
            $table->foreignId('warehouse_id')->constrained();
            $table->date('adjustment_date');
            $table->enum('status', ['draft', 'waiting_approval', 'approved', 'rejected', 'posted'])->default('draft');
            $table->text('reason');
            $table->foreignId('created_by')->constrained('users');
            $table->foreignId('assigned_approver_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('posted_at')->nullable();
            $table->timestamps();
        });
        Schema::create('stock_adjustment_details', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_adjustment_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_id')->constrained();
            $table->foreignId('uom_id')->nullable()->constrained();
            $table->decimal('qty_adjustment', 18, 3);
            $table->string('batch_no')->nullable();
            $table->foreignId('location_id')->nullable()->constrained()->nullOnDelete();
            $table->decimal('unit_price', 18, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('stock_reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_request_detail_id')->constrained()->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained();
            $table->foreignId('item_id')->constrained();
            $table->string('batch_no')->nullable();
            $table->decimal('qty_reserved', 18, 3);
            $table->enum('status', ['active', 'released', 'consumed', 'cancelled'])->default('active');
            $table->timestamps();
        });

        Schema::create('roles', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->timestamps();
        });
        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('module');
            $table->timestamps();
        });
        Schema::create('role_permissions', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'permission_id']);
        });
        Schema::create('role_user', function (Blueprint $table) {
            $table->foreignId('role_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->primary(['role_id', 'user_id']);
        });
        Schema::create('workflow_approvals', function (Blueprint $table) {
            $table->id();
            $table->string('module');
            $table->unsignedBigInteger('transaction_id');
            $table->string('transaction_no');
            $table->enum('status', ['pending', 'approved', 'rejected', 'cancelled'])->default('pending');
            $table->unsignedTinyInteger('current_level')->default(1);
            $table->unsignedTinyInteger('total_levels')->default(1);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->unique(['module', 'transaction_id']);
        });
        Schema::create('workflow_approval_steps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('workflow_approval_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('level');
            $table->foreignId('approver_id')->constrained('users');
            $table->enum('status', ['pending', 'approved', 'rejected', 'skipped'])->default('pending');
            $table->text('remarks')->nullable();
            $table->timestamp('acted_at')->nullable();
            $table->timestamps();
            $table->unique(['workflow_approval_id', 'level']);
        });

        Schema::table('current_stocks', function (Blueprint $table) {
            $table->foreignId('location_id')->nullable()->after('warehouse_id')->constrained()->nullOnDelete();
            $table->foreignId('uom_id')->nullable()->after('item_id')->constrained()->nullOnDelete();
        });
        Schema::table('stock_ledgers', function (Blueprint $table) {
            $table->dropForeign(['stock_transaction_id']);
            $table->foreignId('stock_transaction_id')->nullable()->change();
            $table->foreign('stock_transaction_id')->references('id')->on('stock_transactions')->nullOnDelete();
            $table->foreignId('location_id')->nullable()->after('warehouse_id')->constrained()->nullOnDelete();
            $table->foreignId('uom_id')->nullable()->after('item_id')->constrained()->nullOnDelete();
            $table->string('reference_type')->nullable()->after('stock_transaction_id');
            $table->unsignedBigInteger('reference_id')->nullable()->after('reference_type');
        });
    }

    public function down(): void
    {
        Schema::table('stock_ledgers', fn (Blueprint $table) => $table->dropColumn(['location_id', 'uom_id', 'reference_type', 'reference_id']));
        Schema::table('current_stocks', fn (Blueprint $table) => $table->dropColumn(['location_id', 'uom_id']));
        foreach (['workflow_approval_steps', 'workflow_approvals', 'role_user', 'role_permissions', 'permissions', 'roles', 'stock_reservations', 'stock_adjustment_details', 'stock_adjustments', 'stock_opname_details', 'stock_opnames', 'stock_receipt_details', 'stock_receipts', 'delivery_details', 'deliveries', 'stock_request_details', 'stock_requests', 'goods_receipt_details', 'goods_receipts', 'purchase_order_details', 'purchase_orders', 'locations', 'suppliers', 'item_uoms', 'uoms'] as $table) {
            Schema::dropIfExists($table);
        }
        Schema::table('items', fn (Blueprint $table) => $table->dropColumn(['has_batch', 'has_expired', 'reorder_point', 'issue_method']));
        Schema::table('categories', function (Blueprint $table) {
            $table->dropConstrainedForeignId('parent_id');
            $table->dropColumn('is_active');
        });
    }
};
