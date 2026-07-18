<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoodsReceipt extends Model
{
    protected $fillable = ['number', 'purchase_order_id', 'supplier_id', 'warehouse_id', 'receipt_date', 'status', 'notes', 'received_by', 'assigned_approver_id', 'posted_at'];

    protected $casts = ['receipt_date' => 'date', 'posted_at' => 'datetime'];

    public function details(): HasMany
    {
        return $this->hasMany(GoodsReceiptDetail::class);
    }
}
