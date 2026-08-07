<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransferLayerAllocation extends Model
{
    protected $fillable = [
        'delivery_detail_id', 'source_cost_layer_id', 'batch_no', 'expired_at',
        'source_received_at', 'qty_allocated', 'qty_received', 'unit_cost',
    ];

    protected $casts = [
        'expired_at' => 'date', 'source_received_at' => 'datetime',
        'qty_allocated' => 'decimal:3', 'qty_received' => 'decimal:3', 'unit_cost' => 'decimal:2',
    ];

    public function deliveryDetail(): BelongsTo
    {
        return $this->belongsTo(DeliveryDetail::class);
    }

    public function sourceCostLayer(): BelongsTo
    {
        return $this->belongsTo(StockCostLayer::class, 'source_cost_layer_id');
    }
}
