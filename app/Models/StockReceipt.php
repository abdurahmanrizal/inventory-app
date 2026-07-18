<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockReceipt extends Model
{
    protected $fillable = ['number', 'delivery_id', 'receipt_date', 'status', 'notes', 'received_by'];

    protected $casts = ['receipt_date' => 'date'];

    public function details(): HasMany
    {
        return $this->hasMany(StockReceiptDetail::class);
    }

    public function delivery(): BelongsTo
    {
        return $this->belongsTo(Delivery::class);
    }
}
