<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransactionDetail extends Model
{
    protected $fillable = ['stock_transaction_id', 'item_id', 'qty', 'unit_cost', 'batch_no', 'expired_at', 'notes'];

    protected $casts = ['qty' => 'decimal:3', 'unit_cost' => 'decimal:2', 'expired_at' => 'date'];

    public function transaction(): BelongsTo
    {
        return $this->belongsTo(StockTransaction::class, 'stock_transaction_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
