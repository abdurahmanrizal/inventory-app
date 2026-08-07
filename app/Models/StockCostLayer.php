<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockCostLayer extends Model
{
    protected $fillable = [
        'source_cost_layer_id', 'warehouse_id', 'item_id', 'batch_no', 'expired_at', 'received_at',
        'original_qty', 'remaining_qty', 'unit_cost', 'reference_type', 'reference_id',
    ];

    protected $casts = [
        'expired_at' => 'date',
        'received_at' => 'datetime',
        'original_qty' => 'decimal:3',
        'remaining_qty' => 'decimal:3',
        'unit_cost' => 'decimal:2',
    ];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function sourceLayer(): BelongsTo
    {
        return $this->belongsTo(self::class, 'source_cost_layer_id');
    }
}
