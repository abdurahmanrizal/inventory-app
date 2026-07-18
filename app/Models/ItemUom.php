<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ItemUom extends Model
{
    protected $fillable = ['item_id', 'uom_id', 'conversion_factor', 'is_base'];

    protected $casts = ['conversion_factor' => 'decimal:6', 'is_base' => 'boolean'];
}
