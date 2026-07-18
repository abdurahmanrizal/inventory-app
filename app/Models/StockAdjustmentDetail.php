<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockAdjustmentDetail extends Model
{
    protected $fillable = ['stock_adjustment_id', 'item_id', 'uom_id', 'qty_adjustment', 'batch_no', 'location_id', 'unit_price', 'notes'];

    protected $casts = ['qty_adjustment' => 'decimal:3', 'unit_price' => 'decimal:2'];
}
