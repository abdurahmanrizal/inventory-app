<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockReceiptDetail extends Model
{
    protected $fillable = ['stock_receipt_id', 'delivery_detail_id', 'item_id', 'uom_id', 'qty_received', 'qty_damaged', 'batch_no', 'location_id', 'notes'];

    protected $casts = ['qty_received' => 'decimal:3', 'qty_damaged' => 'decimal:3'];

    public function deliveryDetail(): BelongsTo
    {
        return $this->belongsTo(DeliveryDetail::class);
    }
}
