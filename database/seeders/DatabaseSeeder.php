<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Item;
use App\Models\ItemUom;
use App\Models\Uom;
use App\Models\User;
use App\Models\Warehouse;
use App\Support\AccessPermissions;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        DB::transaction(function (): void {
            $warehouses = $this->seedWarehouses();
            $this->seedAccess();
            $this->seedUsers($warehouses);
            $this->seedItems();
        });
    }

    /** @return array<string, Warehouse> */
    private function seedWarehouses(): array
    {
        $dry = Warehouse::updateOrCreate(['code' => 'WH-DRY'], [
            'name' => 'Gudang Utama Kering', 'type' => 'main', 'main_warehouse_id' => null, 'is_active' => true,
        ]);
        $wet = Warehouse::updateOrCreate(['code' => 'WH-WET'], [
            'name' => 'Gudang Utama Basah', 'type' => 'main', 'main_warehouse_id' => null, 'is_active' => true,
        ]);

        return [
            'dry' => $dry,
            'wet' => $wet,
            'cafe' => Warehouse::updateOrCreate(['code' => 'UNIT-CAFE'], [
                'name' => 'Gudang Unit Cafe', 'type' => 'unit', 'main_warehouse_id' => $dry->id, 'is_active' => true,
            ]),
            'kitchen' => Warehouse::updateOrCreate(['code' => 'UNIT-KITCHEN'], [
                'name' => 'Gudang Unit Kitchen', 'type' => 'unit', 'main_warehouse_id' => $wet->id, 'is_active' => true,
            ]),
            'restaurant' => Warehouse::updateOrCreate(['code' => 'UNIT-RESTO'], [
                'name' => 'Gudang Unit Restaurant', 'type' => 'unit', 'main_warehouse_id' => $dry->id, 'is_active' => true,
            ]),
        ];
    }

    private function seedAccess(): void
    {
        foreach (UserRole::cases() as $role) {
            DB::table('roles')->updateOrInsert(
                ['code' => $role->value],
                ['name' => $role === UserRole::Finance ? 'Keuangan' : ucwords(str_replace('_', ' ', $role->value)), 'description' => 'Role sistem WMS', 'updated_at' => now(), 'created_at' => now()],
            );
        }

        foreach (AccessPermissions::CATALOG as $code => [$name, $description]) {
            DB::table('permissions')->updateOrInsert(
                ['code' => $code],
                ['name' => $name, 'module' => explode('.', $code)[0], 'updated_at' => now(), 'created_at' => now()],
            );
        }

        foreach (AccessPermissions::DEFAULTS as $roleCode => $permissionCodes) {
            $roleId = DB::table('roles')->where('code', $roleCode)->value('id');
            $codes = $permissionCodes === ['*'] ? array_keys(AccessPermissions::CATALOG) : $permissionCodes;
            foreach ($codes as $permissionCode) {
                DB::table('role_permissions')->updateOrInsert([
                    'role_id' => $roleId,
                    'permission_id' => DB::table('permissions')->where('code', $permissionCode)->value('id'),
                ]);
            }
        }
    }

    /** @param array<string, Warehouse> $warehouses */
    private function seedUsers(array $warehouses): void
    {
        $accounts = [
            ['Super Admin', 'superadmin@wms.test', UserRole::Superadmin, null],
            ['Keuangan', 'keuangan@wms.test', UserRole::Finance, null],
            ['Admin Gudang Kering', 'admin.kering@wms.test', UserRole::WarehouseAdminDry, $warehouses['dry']->id],
            ['Manajer Gudang Kering', 'manager.kering@wms.test', UserRole::UnitManager, $warehouses['dry']->id],
            ['Admin Gudang Basah', 'admin.basah@wms.test', UserRole::WarehouseAdminWet, $warehouses['wet']->id],
            ['Manajer Gudang Basah', 'manager.basah@wms.test', UserRole::UnitManager, $warehouses['wet']->id],
            ['Manajer Unit Cafe', 'manager.cafe@wms.test', UserRole::UnitManager, $warehouses['cafe']->id],
            ['User Unit Cafe', 'user.cafe@wms.test', UserRole::UnitUser, $warehouses['cafe']->id],
            ['Manajer Unit Kitchen', 'manager.kitchen@wms.test', UserRole::UnitManager, $warehouses['kitchen']->id],
            ['User Unit Kitchen', 'user.kitchen@wms.test', UserRole::UnitUser, $warehouses['kitchen']->id],
            ['Manajer Unit Restaurant', 'manager.resto@wms.test', UserRole::UnitManager, $warehouses['restaurant']->id],
            ['User Unit Restaurant', 'user.resto@wms.test', UserRole::UnitUser, $warehouses['restaurant']->id],
        ];

        foreach ($accounts as [$name, $email, $role, $warehouseId]) {
            $user = User::updateOrCreate(['email' => $email], [
                'name' => $name, 'password' => 'password', 'email_verified_at' => now(),
                'role' => $role, 'warehouse_id' => $warehouseId,
            ]);
            $roleId = DB::table('roles')->where('code', $role->value)->value('id');
            DB::table('role_user')->updateOrInsert(['user_id' => $user->id, 'role_id' => $roleId]);
        }
    }

    private function seedItems(): void
    {
        $uoms = collect([
            ['code' => 'KG', 'name' => 'Kilogram', 'type' => 'base'],
            ['code' => 'GR', 'name' => 'Gram', 'type' => 'small'],
            ['code' => 'LTR', 'name' => 'Liter', 'type' => 'base'],
        ])->mapWithKeys(function (array $data): array {
            $uom = Uom::updateOrCreate(['code' => $data['code']], $data + ['is_active' => true]);

            return [$data['code'] => $uom];
        });

        $food = Category::updateOrCreate(['code' => 'FOOD'], ['name' => 'Bahan Makanan']);
        $beverage = Category::updateOrCreate(['code' => 'BEV'], ['name' => 'Minuman']);
        $definitions = [
            ['BRG-DRY-001', 'Beras Premium', $food->id, 'KG', 'dry', 50, false],
            ['BRG-DRY-002', 'Tepung Terigu', $food->id, 'KG', 'dry', 30, false],
            ['BRG-WET-001', 'Daging Sapi', $food->id, 'KG', 'wet', 20, true],
            ['BRG-WET-002', 'Daging Ayam', $food->id, 'KG', 'wet', 25, true],
            ['BRG-WET-003', 'Susu Segar', $beverage->id, 'LTR', 'wet', 30, true],
        ];

        foreach ($definitions as [$code, $name, $categoryId, $baseUom, $warehouseType, $minStock, $hasExpired]) {
            $item = Item::updateOrCreate(['code' => $code], [
                'name' => $name, 'category_id' => $categoryId, 'base_uom' => $baseUom,
                'warehouse_type' => $warehouseType, 'valuation_method' => 'moving_average',
                'min_stock' => $minStock, 'reorder_point' => 0, 'issue_method' => $hasExpired ? 'fefo' : 'fifo',
                'has_batch' => true, 'has_expired' => $hasExpired, 'is_active' => true,
            ]);
            ItemUom::updateOrCreate(['item_id' => $item->id, 'uom_id' => $uoms[$baseUom]->id], [
                'conversion_factor' => 1, 'is_base' => true,
            ]);
        }
    }
}
