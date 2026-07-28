<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockOpnameDetail extends Model
{
    protected $fillable = ['stock_opname_id', 'item_id', 'uom_id', 'batch_no', 'location_id', 'system_qty', 'count_qty', 'diff_qty', 'notes'];

    protected $casts = ['system_qty' => 'decimal:3', 'count_qty' => 'decimal:3', 'diff_qty' => 'decimal:3'];

    public function item(): BelongsTo
    {
        return $this->belongsTo(Item::class);
    }
}
