<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Item extends Model
{
    protected $fillable = ['code', 'name', 'category_id', 'base_uom', 'warehouse_type', 'valuation_method', 'min_stock', 'reorder_point', 'has_batch', 'has_expired', 'issue_method', 'is_active'];

    protected $casts = ['min_stock' => 'decimal:3', 'reorder_point' => 'decimal:3', 'has_batch' => 'boolean', 'has_expired' => 'boolean', 'is_active' => 'boolean'];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
