<?php

namespace App\Models;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockTransaction extends Model
{
    protected $fillable = ['number', 'type', 'request_kind', 'stock_out_reason', 'source_warehouse_id', 'destination_warehouse_id', 'supplier_name', 'receipt_image_path', 'payment_proof_image_path', 'delivery_proof_image_path', 'document_date', 'status', 'notes', 'created_by', 'assigned_approver_id', 'approved_by', 'approved_at', 'posted_at'];

    protected $casts = ['type' => TransactionType::class, 'status' => TransactionStatus::class, 'document_date' => 'date', 'approved_at' => 'datetime', 'posted_at' => 'datetime'];

    public function details(): HasMany
    {
        return $this->hasMany(StockTransactionDetail::class);
    }

    public function sourceWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'source_warehouse_id');
    }

    public function destinationWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'destination_warehouse_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function assignedApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_approver_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(Approval::class);
    }
}
