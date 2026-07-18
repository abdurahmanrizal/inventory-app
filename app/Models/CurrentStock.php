<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurrentStock extends Model
{
    protected $fillable = ['warehouse_id', 'location_id', 'item_id', 'uom_id', 'batch_no', 'expired_at', 'qty_on_hand', 'qty_reserved', 'average_cost'];

    protected $casts = ['expired_at' => 'date', 'qty_on_hand' => 'decimal:3', 'qty_reserved' => 'decimal:3', 'average_cost' => 'decimal:2'];

    public function getQtyAvailableAttribute(): float
    {
        return (float) $this->qty_on_hand - (float) $this->qty_reserved;
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}
