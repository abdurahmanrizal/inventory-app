<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockAdjustment extends Model
{
    protected $fillable = ['number', 'stock_opname_id', 'type', 'warehouse_id', 'adjustment_date', 'status', 'reason', 'created_by', 'assigned_approver_id', 'posted_at'];

    protected $casts = ['adjustment_date' => 'date', 'posted_at' => 'datetime'];

    public function details(): HasMany
    {
        return $this->hasMany(StockAdjustmentDetail::class);
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function assignedApprover(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_approver_id');
    }

    public function opname(): BelongsTo
    {
        return $this->belongsTo(StockOpname::class, 'stock_opname_id');
    }
}
