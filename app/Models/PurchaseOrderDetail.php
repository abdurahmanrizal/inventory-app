<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PurchaseOrderDetail extends Model
{
    protected $fillable = ['purchase_order_id', 'item_id', 'uom_id', 'qty_ordered', 'qty_received', 'unit_price'];

    protected $casts = ['qty_ordered' => 'decimal:3', 'qty_received' => 'decimal:3', 'unit_price' => 'decimal:2'];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
