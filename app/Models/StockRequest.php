<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockRequest extends Model
{
    protected $fillable = ['number', 'type', 'from_warehouse_id', 'to_warehouse_id', 'request_date', 'status', 'notes', 'requested_by', 'assigned_approver_id', 'prepared_by', 'prepared_at'];

    protected $casts = ['request_date' => 'date', 'prepared_at' => 'datetime'];

    public function details(): HasMany
    {
        return $this->hasMany(StockRequestDetail::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class);
    }

    public function fromWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }
}
