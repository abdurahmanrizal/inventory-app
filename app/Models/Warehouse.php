<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Warehouse extends Model
{
    protected $fillable = ['code', 'name', 'type', 'inventory_type', 'main_warehouse_id', 'is_active'];

    protected $casts = ['is_active' => 'boolean'];

    public function mainWarehouse(): BelongsTo
    {
        return $this->belongsTo(self::class, 'main_warehouse_id');
    }

    public function stocks(): HasMany
    {
        return $this->hasMany(CurrentStock::class);
    }

    public function users(): HasMany
    {
        return $this->hasMany(User::class);
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class);
    }
}
