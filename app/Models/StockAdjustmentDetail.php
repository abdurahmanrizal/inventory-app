<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockAdjustmentDetail extends Model
{
    protected $fillable = ['stock_adjustment_id', 'item_id', 'uom_id', 'qty_adjustment', 'batch_no', 'location_id', 'unit_price', 'notes'];

    protected $casts = ['qty_adjustment' => 'decimal:3', 'unit_price' => 'decimal:2'];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
