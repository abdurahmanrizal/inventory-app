<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ItemUom extends Model
{
    protected $fillable = ['item_id', 'uom_id', 'conversion_factor', 'is_base'];

    protected $casts = ['conversion_factor' => 'decimal:6', 'is_base' => 'boolean'];

    public function uom(): BelongsTo
    {
        return $this->belongsTo(Uom::class);
    }
}
