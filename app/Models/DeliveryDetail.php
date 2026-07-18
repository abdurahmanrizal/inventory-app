<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeliveryDetail extends Model
{
    protected $fillable = ['delivery_id', 'stock_request_detail_id', 'item_id', 'uom_id', 'qty_delivered', 'batch_no', 'location_id'];

    protected $casts = ['qty_delivered' => 'decimal:3'];

    public function requestDetail(): BelongsTo
    {
        return $this->belongsTo(StockRequestDetail::class, 'stock_request_detail_id');
    }
}
