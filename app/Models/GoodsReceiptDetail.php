<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceiptDetail extends Model
{
    protected $fillable = ['goods_receipt_id', 'purchase_order_detail_id', 'item_id', 'uom_id', 'qty_received', 'unit_price', 'batch_no', 'expired_at', 'location_id'];

    protected $casts = ['qty_received' => 'decimal:3', 'unit_price' => 'decimal:2', 'expired_at' => 'date'];

    public function purchaseOrderDetail(): BelongsTo
    {
        return $this->belongsTo(PurchaseOrderDetail::class);
    }
}
