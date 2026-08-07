<?php

namespace App\Enums;

enum UserRole: string
{
    case Superadmin = 'superadmin';
    case WarehouseAdminDry = 'warehouse_admin_dry';
    case WarehouseAdminWet = 'warehouse_admin_wet';
    case UnitUser = 'unit_user';
    case UnitManager = 'unit_manager';
    case Finance = 'finance';

    public function isWarehouseAdmin(): bool
    {
        return in_array($this, [self::WarehouseAdminDry, self::WarehouseAdminWet], true);
    }
}
