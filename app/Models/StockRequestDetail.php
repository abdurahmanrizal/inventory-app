<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockRequestDetail extends Model
{
    protected $fillable = ['stock_request_id', 'item_id', 'uom_id', 'qty_requested', 'qty_approved', 'qty_delivered', 'qty_received', 'batch_no', 'notes'];

    protected $casts = ['qty_requested' => 'decimal:3', 'qty_approved' => 'decimal:3', 'qty_delivered' => 'decimal:3', 'qty_received' => 'decimal:3'];
}
