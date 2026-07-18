<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Delivery extends Model
{
    protected $fillable = ['number', 'stock_request_id', 'delivery_date', 'status', 'notes', 'delivered_by'];

    protected $casts = ['delivery_date' => 'date'];

    public function details(): HasMany
    {
        return $this->hasMany(DeliveryDetail::class);
    }

    public function stockRequest(): BelongsTo
    {
        return $this->belongsTo(StockRequest::class);
    }
}
