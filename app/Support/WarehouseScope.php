<?php

namespace App\Support;

use App\Models\Warehouse;
use Illuminate\Support\Collection;

final class WarehouseScope
{
    /** @return Collection<int, int> */
    public static function activeMainNetworks(): Collection
    {
        $mainIds = Warehouse::query()
            ->where('is_active', true)
            ->where('type', 'main')
            ->pluck('id');

        return Warehouse::query()
            ->where('is_active', true)
            ->where(fn ($query) => $query
                ->whereIn('id', $mainIds)
                ->orWhereIn('main_warehouse_id', $mainIds))
            ->pluck('id');
    }
}
