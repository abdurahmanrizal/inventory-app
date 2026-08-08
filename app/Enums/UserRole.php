<?php

namespace App\Enums;

enum UserRole: string
{
    case Superadmin = 'superadmin';
    case WarehouseAdminDry = 'warehouse_admin_dry';
    case WarehouseAdminWet = 'warehouse_admin_wet';
    case UnitUser = 'unit_user';
    case UnitManager = 'unit_manager';
    case WarehouseManager = 'warehouse_manager';
    case Finance = 'finance';

    public function isWarehouseAdmin(): bool
    {
        return in_array($this, [self::WarehouseAdminDry, self::WarehouseAdminWet], true);
    }

    public function isTransactionApprover(): bool
    {
        return in_array($this, [self::UnitManager, self::WarehouseManager], true);
    }

    public static function label(self $role): string
    {
        return match ($role) {
            self::Superadmin => 'Super Admin',
            self::WarehouseAdminDry => 'Admin Gudang Kering',
            self::WarehouseAdminWet => 'Admin Gudang Basah',
            self::UnitUser => 'Admin Unit',
            self::UnitManager => 'Manajer Unit / Gudang',
            self::WarehouseManager => 'Manajer Gudang Utama',
            self::Finance => 'Keuangan',
        };
    }
}
