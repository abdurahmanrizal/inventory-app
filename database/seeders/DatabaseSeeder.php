<?php

namespace Database\Seeders;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\CurrentStock;
use App\Models\Item;
use App\Models\ItemUom;
use App\Models\Location;
use App\Models\StockAdjustment;
use App\Models\StockLedger;
use App\Models\StockRequest;
use App\Models\StockTransaction;
use App\Models\Supplier;
use App\Models\Uom;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkflowApproval;
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
            $users = $this->seedUsers($warehouses);
            $items = $this->seedItems();
            $masters = $this->seedExtendedMasterData($warehouses, $items);
            $this->seedOpeningStocks($warehouses, $items, $masters);
            $this->seedActivityHistory($warehouses, $users);
            $this->seedApprovalExamples($warehouses, $users, $items);
            $this->seedWorkflowExamples($warehouses, $users, $items, $masters);
        });
    }

    /** @return array<string, Warehouse> */
    private function seedWarehouses(): array
    {
        $dry = Warehouse::updateOrCreate(['code' => 'WH-DRY'], [
            'name' => 'Gudang Utama Kering', 'type' => 'main',
            'main_warehouse_id' => null, 'is_active' => true,
        ]);
        $wet = Warehouse::updateOrCreate(['code' => 'WH-WET'], [
            'name' => 'Gudang Utama Basah', 'type' => 'main',
            'main_warehouse_id' => null, 'is_active' => true,
        ]);
        $cafe = Warehouse::updateOrCreate(['code' => 'UNIT-CAFE'], [
            'name' => 'Gudang Unit Cafe', 'type' => 'unit',
            'main_warehouse_id' => $dry->id, 'is_active' => true,
        ]);
        $kitchen = Warehouse::updateOrCreate(['code' => 'UNIT-KITCHEN'], [
            'name' => 'Gudang Unit Kitchen', 'type' => 'unit',
            'main_warehouse_id' => $wet->id, 'is_active' => true,
        ]);
        $restaurant = Warehouse::updateOrCreate(['code' => 'UNIT-RESTO'], [
            'name' => 'Gudang Unit Restaurant', 'type' => 'unit',
            'main_warehouse_id' => $dry->id, 'is_active' => true,
        ]);

        return compact('dry', 'wet', 'cafe', 'kitchen', 'restaurant');
    }

    /**
     * Semua akun demo menggunakan password: password
     *
     * @param  array<string, Warehouse>  $warehouses
     * @return array<string, User>
     */
    private function seedUsers(array $warehouses): array
    {
        $accounts = [
            'superadmin' => ['Super Admin', 'superadmin@wms.test', UserRole::Superadmin, null],
            'dryAdmin' => ['Admin Gudang Kering', 'admin.kering@wms.test', UserRole::WarehouseAdminDry, $warehouses['dry']->id],
            'dryManager' => ['Manajer Gudang Kering', 'manager.kering@wms.test', UserRole::UnitManager, $warehouses['dry']->id],
            'wetAdmin' => ['Admin Gudang Basah', 'admin.basah@wms.test', UserRole::WarehouseAdminWet, $warehouses['wet']->id],
            'wetManager' => ['Manajer Gudang Basah', 'manager.basah@wms.test', UserRole::UnitManager, $warehouses['wet']->id],
            'cafeManager' => ['Manajer Unit Cafe', 'manager.cafe@wms.test', UserRole::UnitManager, $warehouses['cafe']->id],
            'cafeUser' => ['User Unit Cafe', 'user.cafe@wms.test', UserRole::UnitUser, $warehouses['cafe']->id],
            'kitchenManager' => ['Manajer Unit Kitchen', 'manager.kitchen@wms.test', UserRole::UnitManager, $warehouses['kitchen']->id],
            'kitchenUser' => ['User Unit Kitchen', 'user.kitchen@wms.test', UserRole::UnitUser, $warehouses['kitchen']->id],
            'restaurantManager' => ['Manajer Unit Restaurant', 'manager.resto@wms.test', UserRole::UnitManager, $warehouses['restaurant']->id],
            'restaurantUser' => ['User Unit Restaurant', 'user.resto@wms.test', UserRole::UnitUser, $warehouses['restaurant']->id],
        ];

        $users = [];
        foreach ($accounts as $key => [$name, $email, $role, $warehouseId]) {
            $users[$key] = User::updateOrCreate(['email' => $email], [
                'name' => $name, 'password' => 'password', 'email_verified_at' => now(),
                'role' => $role, 'warehouse_id' => $warehouseId,
            ]);
        }

        return $users;
    }

    /** @return array<string, Item> */
    private function seedItems(): array
    {
        $food = Category::updateOrCreate(['code' => 'FOOD'], ['name' => 'Bahan Makanan']);
        $beverage = Category::updateOrCreate(['code' => 'BEV'], ['name' => 'Minuman']);
        $supplies = Category::updateOrCreate(['code' => 'SUPPLIES'], ['name' => 'Bahan Pendukung']);

        $definitions = [
            'rice' => ['BRG-DRY-001', 'Beras Premium', $food->id, 'KG', 'dry', 50],
            'flour' => ['BRG-DRY-002', 'Tepung Terigu', $food->id, 'KG', 'dry', 30],
            'coffee' => ['BRG-DRY-003', 'Biji Kopi Arabika', $beverage->id, 'KG', 'dry', 10],
            'beef' => ['BRG-WET-001', 'Daging Sapi', $food->id, 'KG', 'wet', 20],
            'chicken' => ['BRG-WET-002', 'Daging Ayam', $food->id, 'KG', 'wet', 25],
            'milk' => ['BRG-WET-003', 'Susu Segar', $beverage->id, 'LTR', 'wet', 30],
            'sugar' => ['BRG-BOTH-001', 'Gula Pasir', $supplies->id, 'KG', 'both', 25],
        ];

        $items = [];
        foreach ($definitions as $key => [$code, $name, $categoryId, $uom, $warehouseType, $minStock]) {
            $items[$key] = Item::updateOrCreate(['code' => $code], [
                'name' => $name, 'category_id' => $categoryId, 'base_uom' => $uom,
                'warehouse_type' => $warehouseType, 'valuation_method' => 'moving_average',
                'min_stock' => $minStock, 'is_active' => true,
            ]);
        }

        return $items;
    }

    /**
     * @param  array<string, Warehouse>  $warehouses
     * @param  array<string, Item>  $items
     */
    private function seedOpeningStocks(array $warehouses, array $items, array $masters): void
    {
        $stocks = [
            [$warehouses['dry'], $items['rice'], 'DRY-2026-001', 500, 0, 14500, null],
            [$warehouses['dry'], $items['flour'], 'DRY-2026-002', 250, 15, 12000, null],
            [$warehouses['dry'], $items['coffee'], 'DRY-2026-003', 80, 5, 95000, null],
            [$warehouses['dry'], $items['sugar'], 'DRY-2026-004', 180, 10, 16500, null],
            [$warehouses['wet'], $items['beef'], 'WET-2026-001', 120, 10, 118000, now()->addMonths(3)->toDateString()],
            [$warehouses['wet'], $items['chicken'], 'WET-2026-002', 160, 10, 42000, now()->addMonths(2)->toDateString()],
            [$warehouses['wet'], $items['milk'], 'WET-2026-003', 200, 20, 18500, now()->addWeeks(3)->toDateString()],

            // Saldo awal Gudang Unit Cafe (bahan kering).
            [$warehouses['cafe'], $items['coffee'], 'CAFE-COFFEE-001', 24, 2, 97500, null],
            [$warehouses['cafe'], $items['sugar'], 'CAFE-SUGAR-001', 45, 3, 17000, null],
            [$warehouses['cafe'], $items['flour'], 'CAFE-FLOUR-001', 20, 0, 12500, null],

            // Saldo awal Gudang Unit Kitchen (bahan basah dan FEFO).
            [$warehouses['kitchen'], $items['beef'], 'KITCHEN-BEEF-001', 18, 1, 120000, now()->addWeeks(5)->toDateString()],
            [$warehouses['kitchen'], $items['chicken'], 'KITCHEN-CHICKEN-001', 30, 2, 43500, now()->addWeeks(3)->toDateString()],
            [$warehouses['kitchen'], $items['milk'], 'KITCHEN-MILK-001', 36, 3, 19250, now()->addDays(12)->toDateString()],

            // Saldo awal Gudang Unit Restaurant (bahan kering).
            [$warehouses['restaurant'], $items['rice'], 'RESTO-RICE-001', 85, 5, 15000, null],
            [$warehouses['restaurant'], $items['flour'], 'RESTO-FLOUR-001', 40, 2, 12250, null],
            [$warehouses['restaurant'], $items['sugar'], 'RESTO-SUGAR-001', 32, 1, 16800, null],
        ];

        foreach ($stocks as [$warehouse, $item, $batch, $qty, $reserved, $cost, $expiredAt]) {
            $uom = $item->base_uom === 'LTR' ? $masters['liter'] : $masters['kg'];
            $location = Location::where('warehouse_id', $warehouse->id)->where('type', 'zone')->first();
            CurrentStock::updateOrCreate(
                ['warehouse_id' => $warehouse->id, 'item_id' => $item->id, 'batch_no' => $batch],
                ['location_id' => $location?->id, 'uom_id' => $uom->id, 'qty_on_hand' => $qty, 'qty_reserved' => $reserved, 'average_cost' => $cost, 'expired_at' => $expiredAt],
            );
        }
    }

    /**
     * @param  array<string, Warehouse>  $warehouses
     * @param  array<string, User>  $users
     */
    private function seedActivityHistory(array $warehouses, array $users): void
    {
        $creators = [
            $warehouses['dry']->id => $users['dryAdmin']->id,
            $warehouses['wet']->id => $users['wetAdmin']->id,
            $warehouses['cafe']->id => $users['cafeUser']->id,
            $warehouses['kitchen']->id => $users['kitchenUser']->id,
            $warehouses['restaurant']->id => $users['restaurantUser']->id,
        ];

        CurrentStock::orderBy('warehouse_id')->orderBy('item_id')->each(function (CurrentStock $stock) use ($creators): void {
            $issuedQty = min(2, max(1, round((float) $stock->qty_on_hand * 0.03, 3)));
            $openingQty = (float) $stock->qty_on_hand + $issuedQty;
            $creatorId = $creators[$stock->warehouse_id];

            StockLedger::updateOrCreate(
                ['reference_type' => 'opening', 'reference_id' => $stock->id, 'warehouse_id' => $stock->warehouse_id, 'item_id' => $stock->item_id, 'direction' => 'in'],
                ['location_id' => $stock->location_id, 'uom_id' => $stock->uom_id, 'batch_no' => $stock->batch_no, 'expired_at' => $stock->expired_at, 'qty' => $openingQty, 'unit_cost' => $stock->average_cost, 'balance_qty' => $openingQty, 'balance_cost' => $stock->average_cost, 'created_by' => $creatorId, 'created_at' => now()->subDays(14)],
            );

            StockLedger::updateOrCreate(
                ['reference_type' => 'adjustment', 'reference_id' => $stock->id, 'warehouse_id' => $stock->warehouse_id, 'item_id' => $stock->item_id, 'direction' => 'out'],
                ['location_id' => $stock->location_id, 'uom_id' => $stock->uom_id, 'batch_no' => $stock->batch_no, 'expired_at' => $stock->expired_at, 'qty' => $issuedQty, 'unit_cost' => $stock->average_cost, 'balance_qty' => $stock->qty_on_hand, 'balance_cost' => $stock->average_cost, 'created_by' => $creatorId, 'created_at' => now()->subDays(($stock->id % 7) + 1)],
            );
        });
    }

    /**
     * @param  array<string, Warehouse>  $warehouses
     * @param  array<string, User>  $users
     * @param  array<string, Item>  $items
     */
    private function seedApprovalExamples(array $warehouses, array $users, array $items): void
    {
        $cafeRequest = StockTransaction::updateOrCreate(['number' => 'REQ-CAFE-DEMO-001'], [
            'type' => TransactionType::Transfer, 'request_kind' => 'unit_request',
            'source_warehouse_id' => $warehouses['dry']->id, 'destination_warehouse_id' => $warehouses['cafe']->id,
            'document_date' => now()->toDateString(), 'status' => TransactionStatus::WaitingApproval,
            'notes' => 'Kebutuhan operasional Cafe minggu ini.', 'created_by' => $users['cafeUser']->id,
            'assigned_approver_id' => $users['cafeManager']->id,
        ]);
        $cafeRequest->details()->updateOrCreate(['item_id' => $items['coffee']->id], ['qty' => 5, 'unit_cost' => 0, 'batch_no' => 'DRY-2026-003']);
        $cafeRequest->details()->updateOrCreate(['item_id' => $items['sugar']->id], ['qty' => 10, 'unit_cost' => 0, 'batch_no' => 'DRY-2026-004']);

        $kitchenRequest = StockTransaction::updateOrCreate(['number' => 'REQ-KITCHEN-DEMO-001'], [
            'type' => TransactionType::Transfer, 'request_kind' => 'unit_request',
            'source_warehouse_id' => $warehouses['wet']->id, 'destination_warehouse_id' => $warehouses['kitchen']->id,
            'document_date' => now()->toDateString(), 'status' => TransactionStatus::WaitingApproval,
            'notes' => 'Persiapan produksi Kitchen.', 'created_by' => $users['kitchenUser']->id,
            'assigned_approver_id' => $users['kitchenManager']->id,
        ]);
        $kitchenRequest->details()->updateOrCreate(['item_id' => $items['beef']->id], ['qty' => 12, 'unit_cost' => 0, 'batch_no' => 'WET-2026-001']);
        $kitchenRequest->details()->updateOrCreate(['item_id' => $items['chicken']->id], ['qty' => 15, 'unit_cost' => 0, 'batch_no' => 'WET-2026-002']);

        $supplierReceipt = StockTransaction::updateOrCreate(['number' => 'STOCK-IN-DEMO-001'], [
            'type' => TransactionType::StockIn, 'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouses['dry']->id, 'supplier_name' => 'PT Pangan Nusantara',
            'document_date' => now()->toDateString(), 'status' => TransactionStatus::WaitingApproval,
            'notes' => 'Penerimaan pembelian bahan kering.', 'created_by' => $users['dryAdmin']->id,
            'assigned_approver_id' => $users['dryManager']->id,
        ]);
        $supplierReceipt->details()->updateOrCreate(['item_id' => $items['rice']->id], ['qty' => 100, 'unit_cost' => 14800, 'batch_no' => 'DRY-2026-005']);

        $wetSupplierReceipt = StockTransaction::updateOrCreate(['number' => 'STOCK-IN-WET-DEMO-001'], [
            'type' => TransactionType::StockIn, 'request_kind' => 'supplier_receipt',
            'destination_warehouse_id' => $warehouses['wet']->id, 'supplier_name' => 'PT Protein Segar Indonesia',
            'document_date' => now()->toDateString(), 'status' => TransactionStatus::WaitingApproval,
            'notes' => 'Penerimaan pembelian bahan basah.', 'created_by' => $users['wetAdmin']->id,
            'assigned_approver_id' => $users['wetManager']->id,
        ]);
        $wetSupplierReceipt->details()->updateOrCreate(['item_id' => $items['milk']->id], ['qty' => 50, 'unit_cost' => 19000, 'batch_no' => 'WET-2026-004', 'expired_at' => now()->addWeeks(3)]);
    }

    /** @return array<string, mixed> */
    private function seedExtendedMasterData(array $warehouses, array $items): array
    {
        $kg = Uom::updateOrCreate(['code' => 'KG'], ['name' => 'Kilogram', 'type' => 'base', 'is_active' => true]);
        $gram = Uom::updateOrCreate(['code' => 'GR'], ['name' => 'Gram', 'type' => 'small', 'is_active' => true]);
        $liter = Uom::updateOrCreate(['code' => 'LTR'], ['name' => 'Liter', 'type' => 'base', 'is_active' => true]);
        foreach ($items as $item) {
            $uom = $item->base_uom === 'LTR' ? $liter : $kg;
            ItemUom::updateOrCreate(['item_id' => $item->id, 'uom_id' => $uom->id], ['conversion_factor' => 1, 'is_base' => true]);
            if ($item->base_uom === 'KG') {
                ItemUom::updateOrCreate(['item_id' => $item->id, 'uom_id' => $gram->id], ['conversion_factor' => 0.001, 'is_base' => false]);
            }
            $item->update(['has_batch' => true, 'has_expired' => $item->warehouse_type === 'wet', 'reorder_point' => $item->min_stock, 'issue_method' => $item->warehouse_type === 'wet' ? 'fefo' : 'fifo']);
        }

        $foodSupplier = Supplier::updateOrCreate(['code' => 'SUP-FOOD-01'], ['name' => 'PT Pangan Nusantara', 'address' => 'Jakarta', 'phone' => '021-5550101', 'is_active' => true]);
        $freshSupplier = Supplier::updateOrCreate(['code' => 'SUP-FRESH-01'], ['name' => 'PT Protein Segar Indonesia', 'address' => 'Bogor', 'phone' => '021-5550102', 'is_active' => true]);
        foreach ($warehouses as $key => $warehouse) {
            Location::updateOrCreate(['warehouse_id' => $warehouse->id, 'code' => 'ZONE-'.strtoupper($key)], ['name' => 'Zona Utama '.$warehouse->name, 'type' => 'zone', 'is_active' => true]);
        }

        $permissions = [
            ['master.manage', 'Kelola master data', 'master'],
            ['stock.request', 'Ajukan permintaan stok', 'fulfillment'], ['stock.ship', 'Kirim barang', 'fulfillment'],
            ['stock.receive', 'Terima barang', 'fulfillment'], ['stock.adjust', 'Adjustment stok', 'inventory'], ['approval.act', 'Proses approval', 'approval'],
        ];
        foreach (UserRole::cases() as $role) {
            $roleId = DB::table('roles')->updateOrInsert(['code' => $role->value], ['name' => ucwords(str_replace('_', ' ', $role->value)), 'description' => 'Role bisnis WMS', 'created_at' => now(), 'updated_at' => now()]);
        }
        foreach ($permissions as [$code, $name, $module]) {
            DB::table('permissions')->updateOrInsert(['code' => $code], ['name' => $name, 'module' => $module, 'created_at' => now(), 'updated_at' => now()]);
        }
        $roleRows = DB::table('roles')->get();
        $permissionRows = DB::table('permissions')->get();
        foreach ($roleRows as $role) {
            foreach ($permissionRows as $permission) {
                $allowed = $role->code === 'superadmin' || ($role->code === 'unit_manager' && $permission->code === 'approval.act') || ($role->code === 'unit_user' && in_array($permission->code, ['stock.request', 'stock.receive'])) || (str_starts_with($role->code, 'warehouse_admin') && $permission->code !== 'approval.act');
                if ($allowed) {
                    DB::table('role_permissions')->insertOrIgnore(['role_id' => $role->id, 'permission_id' => $permission->id]);
                }
            }
        }
        foreach (User::all() as $user) {
            $roleId = DB::table('roles')->where('code', $user->role->value)->value('id');
            DB::table('role_user')->insertOrIgnore(['role_id' => $roleId, 'user_id' => $user->id]);
        }

        return compact('kg', 'gram', 'liter', 'foodSupplier', 'freshSupplier');
    }

    private function seedWorkflowExamples(array $warehouses, array $users, array $items, array $masters): void
    {
        $request = StockRequest::updateOrCreate(['number' => 'REQ-DEMO-FULL-001'], ['type' => 'transfer', 'from_warehouse_id' => $warehouses['dry']->id, 'to_warehouse_id' => $warehouses['restaurant']->id, 'request_date' => now(), 'status' => 'waiting_approval', 'notes' => 'Demo alur request sampai receipt.', 'requested_by' => $users['restaurantUser']->id, 'assigned_approver_id' => $users['restaurantManager']->id]);
        $request->details()->updateOrCreate(['item_id' => $items['rice']->id], ['uom_id' => $masters['kg']->id, 'qty_requested' => 20]);
        $this->seedWorkflowApproval('stock_request', $request->id, $request->number, $users['restaurantUser']->id, [$users['restaurantManager']->id, $users['dryManager']->id]);

        $adjustment = StockAdjustment::updateOrCreate(['number' => 'ADJ-DEMO-EXPIRED-001'], ['type' => 'expired', 'warehouse_id' => $warehouses['wet']->id, 'adjustment_date' => now(), 'status' => 'waiting_approval', 'reason' => 'Contoh pemusnahan stok kedaluwarsa.', 'created_by' => $users['wetAdmin']->id, 'assigned_approver_id' => $users['wetManager']->id]);
        $adjustment->details()->updateOrCreate(['item_id' => $items['milk']->id], ['uom_id' => $masters['liter']->id, 'qty_adjustment' => -2, 'batch_no' => 'WET-2026-003', 'unit_price' => 18500]);
        $this->seedWorkflowApproval('stock_adjustment', $adjustment->id, $adjustment->number, $users['wetAdmin']->id, [$users['wetManager']->id]);
    }

    private function seedWorkflowApproval(string $module, int $transactionId, string $number, int $creatorId, array $approvers): void
    {
        $approval = WorkflowApproval::updateOrCreate(['module' => $module, 'transaction_id' => $transactionId], ['transaction_no' => $number, 'status' => 'pending', 'current_level' => 1, 'total_levels' => count($approvers), 'created_by' => $creatorId]);
        foreach ($approvers as $index => $approverId) {
            $approval->steps()->updateOrCreate(['level' => $index + 1], ['approver_id' => $approverId, 'status' => 'pending']);
        }
    }
}
