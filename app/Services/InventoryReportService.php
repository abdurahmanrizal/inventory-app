<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Item;
use App\Models\StockLedger;
use App\Models\User;
use App\Models\Warehouse;
use Carbon\Carbon;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class InventoryReportService
{
    public function context(User $user, ?int $requestedWarehouseId): array
    {
        $canViewAll = $user->role === UserRole::Superadmin;
        abort_unless($canViewAll || $user->warehouse_id, 403, 'Akun belum terhubung dengan gudang atau unit.');

        $userWarehouse = $user->warehouse;
        $canViewWarehouseUnits = ! $canViewAll
            && $userWarehouse?->type === 'main'
            && ($user->role?->isWarehouseAdmin() || $user->role === UserRole::UnitManager);
        $canViewUnitAndMain = ! $canViewAll
            && $userWarehouse?->type === 'unit'
            && $user->role === UserRole::UnitManager;

        $ids = $canViewAll
            ? Warehouse::where('is_active', true)->pluck('id')
            : ($canViewWarehouseUnits
                ? Warehouse::where('is_active', true)
                    ->where(fn ($query) => $query->whereKey($user->warehouse_id)->orWhere('main_warehouse_id', $user->warehouse_id))
                    ->pluck('id')
                : ($canViewUnitAndMain
                    ? Warehouse::where('is_active', true)
                        ->where(fn ($query) => $query->where('type', 'main')->orWhere('id', $user->warehouse_id))
                        ->pluck('id')
                    : collect([$user->warehouse_id])));

        $canFilter = $ids->count() > 1;
        $warehouseId = $canFilter ? $requestedWarehouseId : $user->warehouse_id;
        if ($warehouseId) {
            abort_unless($ids->contains($warehouseId), 403, 'Gudang tidak termasuk cakupan akses akun Anda.');
        }

        return [
            'warehouseIds' => $ids,
            'warehouseId' => $warehouseId,
            'canFilterWarehouse' => $canFilter,
            'warehouses' => Warehouse::whereIn('id', $ids)->orderBy('name')->get(['id', 'code', 'name', 'type']),
            'accessLabel' => $canViewAll ? 'Seluruh gudang' : ($canFilter ? 'Gudang dalam cakupan akun' : 'Gudang akun Anda'),
        ];
    }

    public function stockLedger(Collection $warehouseIds, ?int $warehouseId, array $filters): array
    {
        $from = Carbon::parse($filters['date_from'])->startOfDay();
        $to = Carbon::parse($filters['date_to'])->endOfDay();
        $base = StockLedger::query()
            ->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->when($filters['item_id'] ?? null, fn (Builder $query, $id) => $query->where('item_id', $id))
            ->when($filters['batch_no'] ?? null, fn (Builder $query, $batch) => $query->where('batch_no', 'like', '%'.$batch.'%'));

        $opening = (clone $base)->where('created_at', '<', $from)
            ->selectRaw("COALESCE(SUM(CASE WHEN direction = 'in' THEN qty ELSE -qty END), 0) AS qty")
            ->selectRaw("COALESCE(SUM(CASE WHEN direction = 'in' THEN qty * unit_cost ELSE -qty * unit_cost END), 0) AS value")
            ->first();

        $rows = (clone $base)->with(['warehouse:id,code,name', 'item:id,code,name,base_uom', 'creator:id,name', 'stockTransaction:id,number,type'])
            ->whereBetween('created_at', [$from, $to])->oldest('created_at')->oldest('id')->limit(500)->get()
            ->map(function (StockLedger $ledger) {
                $qtyIn = $ledger->direction === 'in' ? (float) $ledger->qty : 0;
                $qtyOut = $ledger->direction === 'out' ? (float) $ledger->qty : 0;

                return [
                    'id' => $ledger->id,
                    'date' => $ledger->created_at?->format('Y-m-d H:i'),
                    'warehouse' => $ledger->warehouse,
                    'item' => $ledger->item,
                    'reference' => $ledger->stockTransaction?->number ?? ($ledger->reference_type ? ucfirst(str_replace('_', ' ', $ledger->reference_type)).' #'.$ledger->reference_id : '-'),
                    'batch_no' => $ledger->batch_no,
                    'qty_in' => $qtyIn,
                    'qty_out' => $qtyOut,
                    'balance_qty' => (float) $ledger->balance_qty,
                    'unit_cost' => (float) $ledger->unit_cost,
                    'creator' => $ledger->creator?->name,
                ];
            });

        return [
            'rows' => $rows,
            'summary' => [
                'opening' => (float) $opening->qty,
                'in' => $rows->sum('qty_in'),
                'out' => $rows->sum('qty_out'),
                'closing' => (float) $opening->qty + $rows->sum('qty_in') - $rows->sum('qty_out'),
                'openingValue' => (float) $opening->value,
            ],
            'limited' => $rows->count() === 500,
        ];
    }

    public function slowMoving(Collection $warehouseIds, ?int $warehouseId, int $days): array
    {
        $cutoff = now()->subDays($days)->endOfDay();
        $lastMovements = StockLedger::query()
            ->select('warehouse_id', 'item_id', DB::raw('MAX(created_at) as last_movement_at'))
            ->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->groupBy('warehouse_id', 'item_id');

        $slowCutoff = now()->subDays(max((int) floor($days / 2), 1))->endOfDay();
        $rows = CurrentStock::query()
            ->leftJoinSub($lastMovements, 'movement', fn ($join) => $join
                ->on('movement.warehouse_id', '=', 'current_stocks.warehouse_id')
                ->on('movement.item_id', '=', 'current_stocks.item_id'))
            ->with(['warehouse:id,code,name', 'item:id,code,name,base_uom,category_id', 'item.category:id,name'])
            ->whereIn('current_stocks.warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('current_stocks.warehouse_id', $warehouseId))
            ->where('qty_on_hand', '>', 0)
            ->select('current_stocks.*', 'movement.last_movement_at')
            ->get()->groupBy(fn (CurrentStock $stock) => $stock->warehouse_id.'-'.$stock->item_id)
            ->map(function (Collection $stocks) use ($cutoff) {
                $first = $stocks->first();
                $lastMovement = $first->last_movement_at ? now()->parse($first->last_movement_at) : null;
                $qty = $stocks->sum(fn ($stock) => (float) $stock->qty_on_hand);
                $value = $stocks->sum(fn ($stock) => (float) $stock->qty_on_hand * (float) $stock->average_cost);
                $inactiveDays = $lastMovement ? $lastMovement->diffInDays(now()) : null;

                return [
                    'id' => $first->warehouse_id.'-'.$first->item_id,
                    'warehouse' => $first->warehouse,
                    'item' => $first->item,
                    'qty' => $qty,
                    'value' => $value,
                    'last_movement_at' => $lastMovement?->format('Y-m-d'),
                    'inactive_days' => $inactiveDays,
                    'status' => ! $lastMovement || $lastMovement->lte($cutoff) ? 'dead' : 'slow',
                ];
            })
            ->filter(fn ($row) => ! $row['last_movement_at'] || now()->parse($row['last_movement_at'])->lte($slowCutoff))
            ->sortBy(fn ($row) => $row['inactive_days'] ?? PHP_INT_MAX)->reverse()->values();

        return [
            'rows' => $rows,
            'summary' => [
                'items' => $rows->count(),
                'dead' => $rows->where('status', 'dead')->count(),
                'slow' => $rows->where('status', 'slow')->count(),
                'value' => $rows->sum('value'),
            ],
        ];
    }

    public function costHistory(Collection $warehouseIds, ?int $warehouseId, array $filters): array
    {
        $from = Carbon::parse($filters['date_from'])->startOfDay();
        $to = Carbon::parse($filters['date_to'])->endOfDay();
        $query = StockLedger::query()
            ->with(['warehouse:id,code,name', 'item:id,code,name,base_uom', 'creator:id,name', 'stockTransaction:id,number,type,supplier_name'])
            ->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $builder) => $builder->where('warehouse_id', $warehouseId))
            ->when($filters['item_id'] ?? null, fn (Builder $builder, $id) => $builder->where('item_id', $id))
            ->when($filters['batch_no'] ?? null, fn (Builder $builder, $batch) => $builder->where('batch_no', 'like', '%'.$batch.'%'))
            ->where('created_at', '<=', $to)
            ->oldest('created_at')
            ->oldest('id');

        $previousCosts = [];
        $rows = $query->get()->map(function (StockLedger $ledger) use (&$previousCosts, $from) {
            $key = implode('|', [$ledger->warehouse_id, $ledger->location_id, $ledger->item_id, $ledger->batch_no]);
            $costBefore = $previousCosts[$key] ?? 0.0;
            $costAfter = (float) $ledger->balance_cost;
            $previousCosts[$key] = $costAfter;

            if ($ledger->direction !== 'in' || $ledger->created_at?->lt($from)) {
                return null;
            }

            $difference = $costAfter - $costBefore;

            return [
                'id' => $ledger->id,
                'date' => $ledger->created_at?->format('Y-m-d H:i'),
                'warehouse' => $ledger->warehouse,
                'item' => $ledger->item,
                'batch_no' => $ledger->batch_no,
                'reference' => $ledger->stockTransaction?->number ?? ($ledger->reference_type ? ucfirst(str_replace('_', ' ', $ledger->reference_type)).' #'.$ledger->reference_id : '-'),
                'supplier' => $ledger->stockTransaction?->supplier_name,
                'incoming_qty' => (float) $ledger->qty,
                'balance_qty' => (float) $ledger->balance_qty,
                'incoming_cost' => (float) $ledger->unit_cost,
                'cost_before' => $costBefore,
                'cost_after' => $costAfter,
                'difference' => $difference,
                'percentage' => $costBefore > 0 ? ($difference / $costBefore) * 100 : null,
                'creator' => $ledger->creator?->name,
            ];
        })->filter()->take(500)->values();

        $latest = $rows->last();
        $changedRows = $rows->filter(fn ($row) => abs($row['difference']) >= 0.01);

        return [
            'rows' => $rows,
            'summary' => [
                'events' => $rows->count(),
                'changes' => $changedRows->count(),
                'latestCost' => $latest['cost_after'] ?? 0,
                'averageChange' => $changedRows->isNotEmpty() ? $changedRows->avg('difference') : 0,
            ],
            'limited' => $rows->count() === 500,
        ];
    }

    public function opname(Collection $warehouseIds, ?int $warehouseId, array $filters): array
    {
        $query = DB::table('stock_opname_details as detail')
            ->join('stock_opnames as opname', 'opname.id', '=', 'detail.stock_opname_id')
            ->join('warehouses as warehouse', 'warehouse.id', '=', 'opname.warehouse_id')
            ->join('items as item', 'item.id', '=', 'detail.item_id')
            ->join('users as creator', 'creator.id', '=', 'opname.created_by')
            ->leftJoin('current_stocks as stock', function ($join) {
                $join->on('stock.warehouse_id', '=', 'opname.warehouse_id')
                    ->on('stock.item_id', '=', 'detail.item_id')
                    ->whereColumn('stock.batch_no', 'detail.batch_no');
            })
            ->whereIn('opname.warehouse_id', $warehouseIds)
            ->when($warehouseId, fn ($builder) => $builder->where('opname.warehouse_id', $warehouseId))
            ->whereBetween('opname.opname_date', [$filters['date_from'], $filters['date_to']])
            ->select([
                'detail.id', 'opname.number', 'opname.opname_date', 'opname.status',
                'warehouse.code as warehouse_code', 'warehouse.name as warehouse_name',
                'item.code as item_code', 'item.name as item_name', 'item.base_uom',
                'detail.batch_no', 'detail.system_qty', 'detail.count_qty', 'detail.diff_qty',
                'creator.name as creator_name',
                DB::raw('COALESCE(MAX(stock.average_cost), 0) as average_cost'),
            ])
            ->groupBy('detail.id', 'opname.number', 'opname.opname_date', 'opname.status', 'warehouse.code', 'warehouse.name', 'item.code', 'item.name', 'item.base_uom', 'detail.batch_no', 'detail.system_qty', 'detail.count_qty', 'detail.diff_qty', 'creator.name')
            ->orderByDesc('opname.opname_date');

        $rows = $query->limit(500)->get()->map(fn ($row) => [
            ...((array) $row),
            'system_qty' => (float) $row->system_qty,
            'count_qty' => (float) $row->count_qty,
            'diff_qty' => (float) $row->diff_qty,
            'difference_value' => (float) $row->diff_qty * (float) $row->average_cost,
        ]);

        return [
            'rows' => $rows,
            'summary' => [
                'sessions' => $rows->pluck('number')->unique()->count(),
                'counted' => $rows->count(),
                'different' => $rows->where('diff_qty', '!=', 0)->count(),
                'differenceValue' => $rows->sum('difference_value'),
            ],
        ];
    }

    public function valuation(Collection $warehouseIds, ?int $warehouseId): array
    {
        $stocks = CurrentStock::with(['warehouse:id,code,name', 'item:id,code,name,category_id', 'item.category:id,name'])
            ->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->get();

        $warehouses = $stocks->groupBy('warehouse_id')->map(function (Collection $rows) {
            $first = $rows->first();

            return ['name' => $first->warehouse->name, 'qty' => $rows->sum('qty_on_hand'), 'value' => $rows->sum(fn ($row) => (float) $row->qty_on_hand * (float) $row->average_cost)];
        })->sortByDesc('value')->values();
        $categories = $stocks->groupBy(fn ($row) => $row->item->category?->name ?? 'Tanpa kategori')->map(fn (Collection $rows, string $name) => [
            'name' => $name,
            'qty' => $rows->sum('qty_on_hand'),
            'value' => $rows->sum(fn ($row) => (float) $row->qty_on_hand * (float) $row->average_cost),
        ])->sortByDesc('value')->values();

        $months = collect(range(5, 0))->map(fn (int $offset) => now()->subMonths($offset)->endOfMonth());
        $ledgers = StockLedger::whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->where('created_at', '<=', $months->last())->oldest('created_at')->get();
        $trend = $months->map(function (CarbonInterface $month) use ($ledgers) {
            $latest = $ledgers->where('created_at', '<=', $month)->groupBy(fn ($row) => implode('-', [$row->warehouse_id, $row->item_id, $row->location_id, $row->batch_no]))
                ->map(fn (Collection $group) => $group->last());

            return ['label' => $month->translatedFormat('M Y'), 'value' => $latest->sum(fn ($row) => (float) $row->balance_qty * (float) $row->balance_cost)];
        });

        return [
            'warehouses' => $warehouses,
            'categories' => $categories,
            'trend' => $trend,
            'summary' => [
                'qty' => $stocks->sum('qty_on_hand'),
                'value' => $stocks->sum(fn ($row) => (float) $row->qty_on_hand * (float) $row->average_cost),
                'warehouses' => $stocks->pluck('warehouse_id')->unique()->count(),
                'categories' => $stocks->pluck('item.category_id')->filter()->unique()->count(),
            ],
        ];
    }

    public function items(): Collection
    {
        return Item::where('is_active', true)->orderBy('name')->get(['id', 'code', 'name']);
    }
}
