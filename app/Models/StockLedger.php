<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockLedger extends Model
{
    public $timestamps = false;

    protected $fillable = ['stock_transaction_id', 'stock_cost_layer_id', 'cost_layer_balance_qty', 'reference_type', 'reference_id', 'warehouse_id', 'location_id', 'item_id', 'uom_id', 'batch_no', 'expired_at', 'direction', 'qty', 'unit_cost', 'balance_qty', 'balance_cost', 'created_by', 'created_at'];

    protected $casts = ['expired_at' => 'date', 'qty' => 'decimal:3', 'unit_cost' => 'decimal:2', 'balance_qty' => 'decimal:3', 'balance_cost' => 'decimal:2', 'cost_layer_balance_qty' => 'decimal:3', 'created_at' => 'datetime'];

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function stockTransaction(): BelongsTo
    {
        return $this->belongsTo(StockTransaction::class);
    }

    public function costLayer(): BelongsTo
    {
        return $this->belongsTo(StockCostLayer::class, 'stock_cost_layer_id');
    }
}
