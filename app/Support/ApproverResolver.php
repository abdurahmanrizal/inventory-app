<?php

namespace App\Support;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\Warehouse;
use Illuminate\Support\Collection;

final class ApproverResolver
{
    /**
     * Manajer yang terikat langsung ke gudang selalu diprioritaskan. Akun
     * warehouse_manager global hanya menjadi fallback untuk gudang utama yang
     * belum mempunyai manajer sendiri.
     */
    public static function forWarehouse(int $warehouseId): ?User
    {
        $type = Warehouse::whereKey($warehouseId)->value('type');
        $scopedManager = User::query()
            ->where('role', UserRole::UnitManager)
            ->where('warehouse_id', $warehouseId)
            ->orderBy('name')
            ->first();
        if ($scopedManager) {
            return $scopedManager;
        }

        if ($type === 'main') {
            $mainManager = User::query()
                ->where('role', UserRole::WarehouseManager)
                ->whereNull('warehouse_id')
                ->orderBy('name')
                ->first();
            if ($mainManager) {
                return $mainManager;
            }
        }

        return null;
    }

    /** @return array<int, User> keyed by warehouse id */
    public static function forWarehouses(array $warehouseIds): array
    {
        $resolved = [];
        foreach (array_unique(array_map('intval', $warehouseIds)) as $warehouseId) {
            $approver = self::forWarehouse($warehouseId);
            if ($approver) {
                $resolved[$warehouseId] = $approver;
            }
        }

        return $resolved;
    }

    /** @return Collection<int, int> */
    public static function mainWarehouseApproverIds(): Collection
    {
        $mainWarehouseIds = Warehouse::query()->where('type', 'main')->pluck('id');

        return User::query()
            ->where(fn ($query) => $query
                ->where('role', UserRole::WarehouseManager)
                ->orWhere(fn ($query) => $query
                    ->where('role', UserRole::UnitManager)
                    ->whereIn('warehouse_id', $mainWarehouseIds)))
            ->pluck('id');
    }

    public static function canRepresentMainWarehouseApprover(User $actor, ?int $approverId): bool
    {
        return $actor->role === UserRole::WarehouseManager
            && $approverId
            && self::mainWarehouseApproverIds()->contains($approverId);
    }
}
