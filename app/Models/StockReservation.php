<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StockReservation extends Model
{
    protected $fillable = ['stock_request_detail_id', 'warehouse_id', 'item_id', 'batch_no', 'qty_reserved', 'status'];

    protected $casts = ['qty_reserved' => 'decimal:3'];
}
