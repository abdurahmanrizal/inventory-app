<?php

namespace App\Models;

use App\Enums\InventoryValuationMethod;
use Illuminate\Database\Eloquent\Model;

class InventorySetting extends Model
{
    protected $fillable = ['valuation_method', 'locked_at'];

    protected $casts = [
        'valuation_method' => InventoryValuationMethod::class,
        'locked_at' => 'datetime',
    ];

    public static function current(): self
    {
        return static::query()->firstOrCreate(
            ['id' => 1],
            ['valuation_method' => InventoryValuationMethod::MovingAverage],
        );
    }
}
