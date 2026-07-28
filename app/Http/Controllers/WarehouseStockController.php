<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Warehouse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseStockController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $canViewAll = $user->role === UserRole::Superadmin;
        abort_unless($canViewAll || $user->warehouse_id, 403, 'Akun belum terhubung dengan gudang atau unit.');

        $userWarehouse = $user->warehouse;
        $canViewWarehouseUnits = ! $canViewAll
            && $userWarehouse?->type === 'main'
            && ($user->role?->isWarehouseAdmin() || $user->role === UserRole::UnitManager);
        $canViewUnitAndMainWarehouses = ! $canViewAll
            && $userWarehouse?->type === 'unit'
            && in_array($user->role, [UserRole::UnitUser, UserRole::UnitManager], true);

        $accessibleWarehouseIds = $canViewAll
            ? Warehouse::where('is_active', true)->pluck('id')
            : ($canViewWarehouseUnits
                ? Warehouse::where('is_active', true)
                    ->where(fn ($query) => $query->whereKey($user->warehouse_id)->orWhere('main_warehouse_id', $user->warehouse_id))
                    ->pluck('id')
                : ($canViewUnitAndMainWarehouses
                    ? Warehouse::where('is_active', true)
                        ->where(fn ($query) => $query->where('type', 'main')->orWhere('id', $user->warehouse_id))
                        ->pluck('id')
                    : collect([$user->warehouse_id])));

        $canFilterWarehouse = $canViewAll || $canViewWarehouseUnits || $canViewUnitAndMainWarehouses;
        $warehouseId = $canFilterWarehouse ? ($request->integer('warehouse_id') ?: null) : $user->warehouse_id;
        if ($warehouseId) {
            abort_unless($accessibleWarehouseIds->contains($warehouseId), 403, 'Gudang tidak termasuk cakupan akses akun Anda.');
        }

        $stocks = CurrentStock::with(['item:id,code,name,base_uom,min_stock,reorder_point,issue_method', 'warehouse:id,code,name,type', 'location:id,code,name'])
            ->when(
                $warehouseId,
                fn ($query) => $query->where('warehouse_id', $warehouseId),
                fn ($query) => $query->whereIn('warehouse_id', $accessibleWarehouseIds),
            )
            ->orderBy('warehouse_id')->orderBy('item_id')->orderBy('expired_at')->get()
            ->map(fn (CurrentStock $stock) => [
                'id' => $stock->id, 'warehouse' => $stock->warehouse, 'item' => $stock->item, 'location' => $stock->location,
                'batch_no' => $stock->batch_no, 'expired_at' => $stock->expired_at?->format('Y-m-d'),
                'qty_on_hand' => (float) $stock->qty_on_hand, 'qty_reserved' => (float) $stock->qty_reserved,
                'qty_available' => $stock->qty_available, 'average_cost' => (float) $stock->average_cost,
                'stock_value' => (float) $stock->qty_on_hand * (float) $stock->average_cost,
            ]);

        return Inertia::render('WarehouseStock/Index', [
            'stocks' => $stocks,
            'warehouses' => $canFilterWarehouse
                ? Warehouse::whereIn('id', $accessibleWarehouseIds)->orderByRaw("type = 'main' desc")->orderBy('name')->get(['id', 'code', 'name', 'type'])
                : [],
            'selectedWarehouse' => $warehouseId,
            'canViewAll' => $canViewAll,
            'canFilterWarehouse' => $canFilterWarehouse,
            'accessLabel' => $canViewAll
                ? 'Akses seluruh gudang'
                : ($canViewWarehouseUnits
                    ? 'Akses gudang utama dan seluruh unit terkait'
                    : ($canViewUnitAndMainWarehouses ? 'Akses gudang utama kering/basah dan unit Anda' : 'Akses gudang/unit akun Anda')),
            'summary' => ['items' => $stocks->count(), 'onHand' => $stocks->sum('qty_on_hand'), 'reserved' => $stocks->sum('qty_reserved'), 'available' => $stocks->sum('qty_available'), 'value' => $stocks->sum('stock_value')],
        ]);
    }
}
