<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockOpname extends Model
{
    protected $fillable = ['number', 'warehouse_id', 'opname_date', 'status', 'notes', 'created_by', 'assigned_approver_id'];

    protected $casts = ['opname_date' => 'date'];

    public function details(): HasMany
    {
        return $this->hasMany(StockOpnameDetail::class);
    }
}
