<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\InventorySetting;
use App\Models\Item;
use App\Models\StockCostLayer;
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
        $canViewAll = in_array($user->role, [UserRole::Superadmin, UserRole::Finance], true);
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

        $periodTotals = (clone $base)->whereBetween('created_at', [$from, $to])
            ->selectRaw("COALESCE(SUM(CASE WHEN direction = 'in' THEN qty ELSE 0 END), 0) AS qty_in")
            ->selectRaw("COALESCE(SUM(CASE WHEN direction = 'out' THEN qty ELSE 0 END), 0) AS qty_out")
            ->selectRaw("COALESCE(SUM(CASE WHEN direction = 'in' THEN qty * unit_cost ELSE 0 END), 0) AS value_in")
            ->selectRaw("COALESCE(SUM(CASE WHEN direction = 'out' THEN qty * unit_cost ELSE 0 END), 0) AS value_out")
            ->first();

        $rows = (clone $base)->with(['warehouse:id,code,name', 'item:id,code,name,base_uom', 'creator:id,name', 'stockTransaction:id,number,type,request_kind,stock_out_reason'])
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
                    'movement_note' => $this->stockLedgerMovementNote($ledger),
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
                'in' => (float) $periodTotals->qty_in,
                'out' => (float) $periodTotals->qty_out,
                'closing' => (float) $opening->qty + (float) $periodTotals->qty_in - (float) $periodTotals->qty_out,
                'openingValue' => (float) $opening->value,
                'incomingValue' => (float) $periodTotals->value_in,
                'outgoingValue' => (float) $periodTotals->value_out,
                'closingValue' => (float) $opening->value + (float) $periodTotals->value_in - (float) $periodTotals->value_out,
            ],
            'limited' => $rows->count() === 500,
        ];
    }

    private function stockLedgerMovementNote(StockLedger $ledger): string
    {
        $transaction = $ledger->stockTransaction;
        if ($ledger->direction !== 'out' || ! $transaction) {
            return '-';
        }
        if ($transaction->request_kind === 'unit_return') {
            return 'Pengembalian ke gudang utama';
        }
        if ($transaction->type->value !== 'stock_out') {
            return '-';
        }

        return [
            'operational' => 'Pemakaian operasional',
            'waste' => 'Waste / terbuang',
            'return' => 'Retur ke supplier',
            'restitution' => 'Pengembalian',
            'shrinkage' => 'Penyusutan',
            'expired' => 'Kedaluwarsa',
            'damaged' => 'Barang rusak',
            'other' => 'Lainnya',
        ][$transaction->stock_out_reason] ?? 'Jenis pengeluaran tidak dicantumkan';
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
        $fifoValues = $this->fifoValuesByWarehouseItem($warehouseIds, $warehouseId);
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
            ->map(function (Collection $stocks) use ($cutoff, $fifoValues) {
                $first = $stocks->first();
                $lastMovement = $first->last_movement_at ? now()->parse($first->last_movement_at) : null;
                $qty = $stocks->sum(fn ($stock) => (float) $stock->qty_on_hand);
                $value = InventorySetting::current()->valuation_method->value === 'fifo'
                    ? $stocks->sum(fn (CurrentStock $stock) => (float) ($fifoValues->get($stock->warehouse_id.'|'.$stock->item_id.'|'.($stock->batch_no ?? '')) ?? 0))
                    : $stocks->sum(fn ($stock) => (float) $stock->qty_on_hand * (float) $stock->average_cost);
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
        if (InventorySetting::current()->valuation_method->value === 'fifo') {
            return $this->fifoConsumptionHistory($warehouseIds, $warehouseId, $filters);
        }

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
            'method' => 'moving_average',
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

    private function fifoConsumptionHistory(Collection $warehouseIds, ?int $warehouseId, array $filters): array
    {
        $from = Carbon::parse($filters['date_from'])->startOfDay();
        $to = Carbon::parse($filters['date_to'])->endOfDay();
        $rows = StockLedger::query()
            ->with([
                'warehouse:id,code,name', 'item:id,code,name,base_uom', 'creator:id,name',
                'stockTransaction:id,number,type',
                'costLayer:id,received_at,original_qty,unit_cost,reference_type,reference_id',
            ])
            ->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->when($filters['item_id'] ?? null, fn (Builder $query, $id) => $query->where('item_id', $id))
            ->when($filters['batch_no'] ?? null, fn (Builder $query, $batch) => $query->where('batch_no', 'like', '%'.$batch.'%'))
            ->where('direction', 'out')->whereBetween('created_at', [$from, $to])
            ->oldest('created_at')->oldest('id')->limit(1000)->get()
            ->map(fn (StockLedger $ledger) => [
                'id' => $ledger->id,
                'date' => $ledger->created_at?->format('Y-m-d H:i'),
                'warehouse' => $ledger->warehouse,
                'item' => $ledger->item,
                'batch_no' => $ledger->batch_no,
                'issue_reference' => $ledger->stockTransaction?->number ?? ($ledger->reference_type ? ucfirst(str_replace('_', ' ', $ledger->reference_type)).' #'.$ledger->reference_id : '-'),
                'layer_id' => $ledger->stock_cost_layer_id,
                'layer_received_at' => $ledger->costLayer?->received_at?->format('Y-m-d H:i'),
                'layer_reference' => $ledger->costLayer?->reference_type
                    ? ucfirst(str_replace('_', ' ', $ledger->costLayer->reference_type)).' #'.$ledger->costLayer->reference_id
                    : '-',
                'layer_original_qty' => (float) ($ledger->costLayer?->original_qty ?? 0),
                'consumed_qty' => (float) $ledger->qty,
                'layer_balance_qty' => $ledger->cost_layer_balance_qty === null ? null : (float) $ledger->cost_layer_balance_qty,
                'unit_cost' => (float) $ledger->unit_cost,
                'total_cost' => (float) $ledger->qty * (float) $ledger->unit_cost,
                'creator' => $ledger->creator?->name,
            ]);

        return [
            'method' => 'fifo',
            'rows' => $rows,
            'summary' => [
                'issues' => $rows->pluck('issue_reference')->unique()->count(),
                'allocations' => $rows->count(),
                'layers' => $rows->pluck('layer_id')->filter()->unique()->count(),
                'qty' => $rows->sum('consumed_qty'),
                'totalCost' => $rows->sum('total_cost'),
            ],
            'limited' => $rows->count() === 1000,
        ];
    }

    public function opname(Collection $warehouseIds, ?int $warehouseId, array $filters): array
    {
        $query = DB::table('stock_opname_details as detail')
            ->join('stock_opnames as opname', 'opname.id', '=', 'detail.stock_opname_id')
            ->join('warehouses as warehouse', 'warehouse.id', '=', 'opname.warehouse_id')
            ->join('items as item', 'item.id', '=', 'detail.item_id')
            ->join('users as creator', 'creator.id', '=', 'opname.created_by')
            ->leftJoin('stock_adjustments as adjustment', 'adjustment.stock_opname_id', '=', 'opname.id')
            ->leftJoin('stock_adjustment_details as adjustment_detail', function ($join) {
                $join->on('adjustment_detail.stock_adjustment_id', '=', 'adjustment.id')
                    ->on('adjustment_detail.item_id', '=', 'detail.item_id');
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
                DB::raw('COALESCE(MAX(adjustment_detail.unit_price), 0) as valuation_cost'),
                DB::raw("COALESCE(MAX(adjustment.valuation_method), 'moving_average') as valuation_method"),
            ])
            ->groupBy('detail.id', 'opname.number', 'opname.opname_date', 'opname.status', 'warehouse.code', 'warehouse.name', 'item.code', 'item.name', 'item.base_uom', 'detail.batch_no', 'detail.system_qty', 'detail.count_qty', 'detail.diff_qty', 'creator.name')
            ->orderByDesc('opname.opname_date');

        $rows = $query->limit(500)->get()->map(fn ($row) => [
            ...((array) $row),
            'system_qty' => (float) $row->system_qty,
            'count_qty' => (float) $row->count_qty,
            'diff_qty' => (float) $row->diff_qty,
            'valuation_cost' => (float) $row->valuation_cost,
            'difference_value' => (float) $row->diff_qty * (float) $row->valuation_cost,
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

        $fifoValues = $this->fifoValuesByWarehouseItem($warehouseIds, $warehouseId);
        $valueOf = fn (CurrentStock $stock) => InventorySetting::current()->valuation_method->value === 'fifo'
            ? (float) ($fifoValues->get($stock->warehouse_id.'|'.$stock->item_id.'|'.($stock->batch_no ?? '')) ?? 0)
            : (float) $stock->qty_on_hand * (float) $stock->average_cost;
        $warehouses = $stocks->groupBy('warehouse_id')->map(function (Collection $rows) use ($valueOf) {
            $first = $rows->first();

            return ['name' => $first->warehouse->name, 'qty' => $rows->sum('qty_on_hand'), 'value' => $rows->sum($valueOf)];
        })->sortByDesc('value')->values();
        $categories = $stocks->groupBy(fn ($row) => $row->item->category?->name ?? 'Tanpa kategori')->map(fn (Collection $rows, string $name) => [
            'name' => $name,
            'qty' => $rows->sum('qty_on_hand'),
            'value' => $rows->sum($valueOf),
        ])->sortByDesc('value')->values();

        $months = collect(range(5, 0))->map(fn (int $offset) => now()->subMonths($offset)->endOfMonth());
        $ledgers = StockLedger::whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->where('created_at', '<=', $months->last())->oldest('created_at')->get();
        $trend = $months->map(function (CarbonInterface $month) use ($ledgers) {
            $periodLedgers = $ledgers->where('created_at', '<=', $month);

            return [
                'label' => $month->translatedFormat('M Y'),
                'value' => $periodLedgers->sum(fn (StockLedger $row) => ($row->direction === 'in' ? 1 : -1) * (float) $row->qty * (float) $row->unit_cost),
            ];
        });

        return [
            'warehouses' => $warehouses,
            'categories' => $categories,
            'trend' => $trend,
            'summary' => [
                'qty' => $stocks->sum('qty_on_hand'),
                'value' => $stocks->sum($valueOf),
                'warehouses' => $stocks->pluck('warehouse_id')->unique()->count(),
                'categories' => $stocks->pluck('item.category_id')->filter()->unique()->count(),
            ],
        ];
    }

    public function purchaseHistory(Collection $warehouseIds, ?int $warehouseId, array $filters): array
    {
        $query = DB::table('stock_transaction_details as detail')
            ->join('stock_transactions as stock_tx', 'stock_tx.id', '=', 'detail.stock_transaction_id')
            ->join('warehouses as warehouse', 'warehouse.id', '=', 'stock_tx.destination_warehouse_id')
            ->join('items as item', 'item.id', '=', 'detail.item_id')
            ->join('users as creator', 'creator.id', '=', 'stock_tx.created_by')
            ->join('users as approver', 'approver.id', '=', 'stock_tx.approved_by')
            ->where('stock_tx.type', 'stock_in')
            ->where('stock_tx.request_kind', 'supplier_receipt')
            ->where('stock_tx.status', 'completed')
            ->whereNotNull('stock_tx.approved_at')
            ->whereNotNull('stock_tx.posted_at')
            ->whereIn('stock_tx.destination_warehouse_id', $warehouseIds)
            ->when($warehouseId, fn ($builder) => $builder->where('stock_tx.destination_warehouse_id', $warehouseId))
            ->when($filters['item_id'] ?? null, fn ($builder, $id) => $builder->where('detail.item_id', $id))
            ->when($filters['batch_no'] ?? null, fn ($builder, $batch) => $builder->where('detail.batch_no', 'like', '%'.$batch.'%'))
            ->when($filters['supplier_name'] ?? null, fn ($builder, $supplier) => $builder->where('stock_tx.supplier_name', 'like', '%'.trim($supplier).'%'))
            ->when($filters['search'] ?? null, function ($builder, $search) {
                $term = '%'.trim($search).'%';
                $builder->where(fn ($nested) => $nested
                    ->where('stock_tx.number', 'like', $term)
                    ->orWhere('stock_tx.supplier_name', 'like', $term)
                    ->orWhere('item.code', 'like', $term)
                    ->orWhere('item.name', 'like', $term));
            })
            ->whereDate('stock_tx.document_date', '>=', $filters['date_from'])
            ->whereDate('stock_tx.document_date', '<=', $filters['date_to']);

        $summary = (clone $query)
            ->selectRaw('COUNT(DISTINCT stock_tx.id) as transactions')
            ->selectRaw('COUNT(DISTINCT stock_tx.supplier_name) as suppliers')
            ->selectRaw('COALESCE(SUM(detail.qty), 0) as qty')
            ->selectRaw('COALESCE(SUM(detail.qty * detail.unit_cost), 0) as total_value')
            ->first();

        $rows = (clone $query)->select([
            'detail.id as detail_id', 'stock_tx.id as transaction_id', 'stock_tx.number as transaction_number',
            'stock_tx.document_date', 'stock_tx.supplier_name', 'stock_tx.approved_at', 'stock_tx.posted_at',
            'warehouse.code as warehouse_code', 'warehouse.name as warehouse_name',
            'item.id as item_id', 'item.code as item_code', 'item.name as item_name', 'item.base_uom',
            'detail.qty', 'detail.unit_cost', 'detail.batch_no', 'detail.expired_at',
            'creator.name as created_by_name', 'approver.name as approved_by_name',
        ])->orderByDesc('stock_tx.posted_at')->orderByDesc('stock_tx.id')->orderBy('detail.id')->limit(1000)->get();

        $layerIds = StockCostLayer::query()
            ->where('reference_type', 'stock_transaction')
            ->whereIn('reference_id', $rows->pluck('transaction_id')->unique())
            ->get(['id', 'reference_id', 'item_id', 'batch_no'])
            ->groupBy(fn (StockCostLayer $layer) => $layer->reference_id.'|'.$layer->item_id.'|'.($layer->batch_no ?? ''));

        $mapped = $rows->map(function ($row) use ($layerIds) {
            $qty = (float) $row->qty;
            $cost = (float) $row->unit_cost;

            return [
                ...((array) $row),
                'qty' => $qty,
                'unit_cost' => $cost,
                'total_value' => $qty * $cost,
                'fifo_layer_ids' => $layerIds
                    ->get($row->transaction_id.'|'.$row->item_id.'|'.($row->batch_no ?? ''), collect())
                    ->pluck('id')->values()->all(),
                'valuation_method' => InventorySetting::current()->valuation_method->value,
            ];
        });

        return [
            'rows' => $mapped,
            'summary' => [
                'transactions' => (int) $summary->transactions,
                'suppliers' => (int) $summary->suppliers,
                'qty' => (float) $summary->qty,
                'totalValue' => (float) $summary->total_value,
            ],
            'valuation_method' => InventorySetting::current()->valuation_method->value,
            'limited' => $mapped->count() === 1000,
        ];
    }

    public function financialMovement(Collection $warehouseIds, ?int $warehouseId, array $filters): array
    {
        $from = Carbon::parse($filters['date_from'])->startOfDay();
        $to = Carbon::parse($filters['date_to'])->endOfDay();
        $base = StockLedger::query()->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->when($filters['item_id'] ?? null, fn (Builder $query, $id) => $query->where('item_id', $id));

        $opening = (float) (clone $base)->where('created_at', '<', $from)
            ->selectRaw("COALESCE(SUM(CASE WHEN direction = 'in' THEN qty * unit_cost ELSE -qty * unit_cost END), 0) AS value")
            ->value('value');
        $period = (clone $base)->with(['warehouse:id,code,name', 'item:id,code,name,base_uom', 'stockTransaction:id,number,type'])
            ->whereBetween('created_at', [$from, $to])->oldest('created_at')->oldest('id')->get();
        $incoming = $period->where('direction', 'in')->sum(fn (StockLedger $row) => (float) $row->qty * (float) $row->unit_cost);
        $outgoing = $period->where('direction', 'out')->sum(fn (StockLedger $row) => (float) $row->qty * (float) $row->unit_cost);
        $closing = $opening + $incoming - $outgoing;

        $rows = $period->groupBy(fn (StockLedger $row) => $row->warehouse_id.'|'.$row->item_id)
            ->map(function (Collection $group) {
                /** @var StockLedger $first */
                $first = $group->first();
                $qtyIn = $group->where('direction', 'in')->sum('qty');
                $qtyOut = $group->where('direction', 'out')->sum('qty');
                $valueIn = $group->where('direction', 'in')->sum(fn (StockLedger $row) => (float) $row->qty * (float) $row->unit_cost);
                $valueOut = $group->where('direction', 'out')->sum(fn (StockLedger $row) => (float) $row->qty * (float) $row->unit_cost);

                return [
                    'id' => $first->warehouse_id.'-'.$first->item_id,
                    'warehouse' => $first->warehouse,
                    'item' => $first->item,
                    'qty_in' => (float) $qtyIn,
                    'qty_out' => (float) $qtyOut,
                    'value_in' => $valueIn,
                    'value_out' => $valueOut,
                    'net_value' => $valueIn - $valueOut,
                ];
            })->values();

        $operationalValue = null;
        if ($to->isToday()) {
            $operationalValue = $this->currentInventoryValue($warehouseIds, $warehouseId, $filters['item_id'] ?? null);
        }

        return [
            'rows' => $rows,
            'summary' => [
                'openingValue' => $opening,
                'incomingValue' => $incoming,
                'outgoingValue' => $outgoing,
                'closingValue' => $closing,
                'operationalValue' => $operationalValue,
                'difference' => $operationalValue === null ? null : $operationalValue - $closing,
            ],
            'valuation_method' => InventorySetting::current()->valuation_method->value,
        ];
    }

    public function issueCost(Collection $warehouseIds, ?int $warehouseId, array $filters): array
    {
        $from = Carbon::parse($filters['date_from'])->startOfDay();
        $to = Carbon::parse($filters['date_to'])->endOfDay();
        $rows = StockLedger::query()
            ->with(['warehouse:id,code,name', 'item:id,code,name,base_uom', 'stockTransaction:id,number,type,stock_out_reason'])
            ->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->when($filters['item_id'] ?? null, fn (Builder $query, $id) => $query->where('item_id', $id))
            ->where('direction', 'out')->whereBetween('created_at', [$from, $to])
            ->oldest('created_at')->oldest('id')->limit(1000)->get()
            ->map(function (StockLedger $ledger) {
                $classification = $this->issueClassification($ledger);

                return [
                    'id' => $ledger->id,
                    'date' => $ledger->created_at?->format('Y-m-d H:i'),
                    'warehouse' => $ledger->warehouse,
                    'item' => $ledger->item,
                    'reference' => $ledger->stockTransaction?->number ?? ($ledger->reference_type ? ucfirst(str_replace('_', ' ', $ledger->reference_type)).' #'.$ledger->reference_id : '-'),
                    'batch_no' => $ledger->batch_no,
                    'qty' => (float) $ledger->qty,
                    'unit_cost' => (float) $ledger->unit_cost,
                    'total_cost' => (float) $ledger->qty * (float) $ledger->unit_cost,
                    'classification' => $classification,
                    'journal_debit' => match ($classification) {
                        'internal_transfer' => 'Persediaan - Gudang Tujuan',
                        'adjustment' => 'Beban Selisih Persediaan',
                        default => 'HPP / Beban Pemakaian',
                    },
                    'journal_credit' => 'Persediaan - Gudang Sumber',
                ];
            });

        return [
            'rows' => $rows,
            'summary' => [
                'transactions' => $rows->pluck('reference')->unique()->count(),
                'qty' => $rows->sum('qty'),
                'totalCost' => $rows->sum('total_cost'),
                'internalCost' => $rows->where('classification', 'internal_transfer')->sum('total_cost'),
                'expenseCost' => $rows->whereIn('classification', ['expense', 'adjustment'])->sum('total_cost'),
            ],
            'valuation_method' => InventorySetting::current()->valuation_method->value,
            'limited' => $rows->count() === 1000,
        ];
    }

    public function valuationAudit(Collection $warehouseIds, ?int $warehouseId, array $filters): array
    {
        $method = InventorySetting::current()->valuation_method->value;
        if ($method === 'fifo') {
            $layers = StockCostLayer::query()->with(['warehouse:id,code,name', 'item:id,code,name,base_uom'])
                ->whereIn('warehouse_id', $warehouseIds)
                ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
                ->when($filters['item_id'] ?? null, fn (Builder $query, $id) => $query->where('item_id', $id))
                ->where('remaining_qty', '>', 0)->oldest('received_at')->oldest('id')->limit(1000)->get()
                ->map(fn (StockCostLayer $layer) => [
                    'id' => $layer->id,
                    'date' => $layer->received_at?->format('Y-m-d H:i'),
                    'warehouse' => $layer->warehouse,
                    'item' => $layer->item,
                    'batch_no' => $layer->batch_no,
                    'reference' => $layer->reference_type ? ucfirst(str_replace('_', ' ', $layer->reference_type)).' #'.$layer->reference_id : '-',
                    'original_qty' => (float) $layer->original_qty,
                    'remaining_qty' => (float) $layer->remaining_qty,
                    'unit_cost' => (float) $layer->unit_cost,
                    'remaining_value' => (float) $layer->remaining_qty * (float) $layer->unit_cost,
                    'age_days' => $layer->received_at?->diffInDays(now()),
                ]);

            return [
                'method' => $method,
                'rows' => $layers,
                'summary' => [
                    'layers' => $layers->count(),
                    'qty' => $layers->sum('remaining_qty'),
                    'value' => $layers->sum('remaining_value'),
                    'oldLayers' => $layers->where('age_days', '>', 90)->count(),
                ],
            ];
        }

        $history = $this->costHistory($warehouseIds, $warehouseId, $filters);

        return ['method' => $method, ...$history];
    }

    public function anomalies(Collection $warehouseIds, ?int $warehouseId): array
    {
        $stockQuery = CurrentStock::query()->with(['warehouse:id,code,name', 'item:id,code,name'])
            ->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId));
        $rows = (clone $stockQuery)->where(fn (Builder $query) => $query
            ->where('qty_on_hand', '<', 0)
            ->orWhere(fn (Builder $nested) => $nested->where('qty_on_hand', '>', 0)->where('average_cost', '<=', 0)))
            ->get()->map(fn (CurrentStock $stock) => [
                'id' => 'stock-'.$stock->id,
                'type' => (float) $stock->qty_on_hand < 0 ? 'negative_stock' : 'zero_cost_stock',
                'severity' => 'high',
                'warehouse' => $stock->warehouse,
                'item' => $stock->item,
                'batch_no' => $stock->batch_no,
                'qty' => (float) $stock->qty_on_hand,
                'value' => (float) $stock->qty_on_hand * (float) $stock->average_cost,
                'message' => (float) $stock->qty_on_hand < 0 ? 'Saldo stok bernilai negatif.' : 'Stok memiliki biaya nol.',
            ]);

        $zeroCostLedgers = StockLedger::query()->with(['warehouse:id,code,name', 'item:id,code,name'])
            ->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->where('qty', '>', 0)->where('unit_cost', '<=', 0)->latest('created_at')->limit(100)->get();
        foreach ($zeroCostLedgers as $ledger) {
            $rows->push([
                'id' => 'ledger-'.$ledger->id, 'type' => 'zero_cost_movement', 'severity' => 'high',
                'warehouse' => $ledger->warehouse, 'item' => $ledger->item, 'batch_no' => $ledger->batch_no,
                'qty' => (float) $ledger->qty, 'value' => 0,
                'message' => 'Mutasi '.$ledger->direction.' diposting dengan biaya nol.',
            ]);
        }

        if (InventorySetting::current()->valuation_method->value === 'fifo') {
            $layerBalances = StockCostLayer::query()->whereIn('warehouse_id', $warehouseIds)
                ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
                ->selectRaw("warehouse_id, item_id, COALESCE(batch_no, '') as batch_key, SUM(remaining_qty) as layer_qty")
                ->groupBy('warehouse_id', 'item_id', 'batch_key')->get();
            foreach ($layerBalances as $balance) {
                $stock = (clone $stockQuery)->where('warehouse_id', $balance->warehouse_id)->where('item_id', $balance->item_id)
                    ->where('batch_no', $balance->batch_key === '' ? null : $balance->batch_key)->first();
                if (! $stock || abs((float) $balance->layer_qty - (float) $stock->qty_on_hand) > 0.001) {
                    $rows->push([
                        'id' => 'layer-'.$balance->warehouse_id.'-'.$balance->item_id.'-'.$balance->batch_key,
                        'type' => 'fifo_mismatch', 'severity' => 'high', 'warehouse' => $stock?->warehouse,
                        'item' => $stock?->item, 'batch_no' => $balance->batch_key ?: null,
                        'qty' => (float) $balance->layer_qty, 'value' => 0,
                        'message' => 'Kuantitas layer FIFO tidak sama dengan saldo stok.',
                    ]);
                }
            }
            $layerKeys = $layerBalances->mapWithKeys(fn ($balance) => [
                $balance->warehouse_id.'|'.$balance->item_id.'|'.$balance->batch_key => (float) $balance->layer_qty,
            ]);
            foreach ((clone $stockQuery)->where('qty_on_hand', '>', 0)->get() as $stock) {
                $key = $stock->warehouse_id.'|'.$stock->item_id.'|'.($stock->batch_no ?? '');
                if (! $layerKeys->has($key)) {
                    $rows->push([
                        'id' => 'missing-layer-'.$stock->id, 'type' => 'fifo_mismatch', 'severity' => 'high',
                        'warehouse' => $stock->warehouse, 'item' => $stock->item, 'batch_no' => $stock->batch_no,
                        'qty' => (float) $stock->qty_on_hand, 'value' => 0,
                        'message' => 'Saldo stok tidak memiliki layer FIFO aktif.',
                    ]);
                }
            }
        }

        return ['rows' => $rows->values(), 'summary' => ['issues' => $rows->count(), 'high' => $rows->where('severity', 'high')->count()]];
    }

    private function currentInventoryValue(Collection $warehouseIds, ?int $warehouseId, mixed $itemId): float
    {
        if (InventorySetting::current()->valuation_method->value === 'fifo') {
            return (float) StockCostLayer::query()->whereIn('warehouse_id', $warehouseIds)
                ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
                ->when($itemId, fn (Builder $query, $id) => $query->where('item_id', $id))
                ->selectRaw('COALESCE(SUM(remaining_qty * unit_cost), 0) as value')->value('value');
        }

        return (float) CurrentStock::query()->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->when($itemId, fn (Builder $query, $id) => $query->where('item_id', $id))
            ->selectRaw('COALESCE(SUM(qty_on_hand * average_cost), 0) as value')->value('value');
    }

    private function issueClassification(StockLedger $ledger): string
    {
        if ($ledger->reference_type === 'delivery' || $ledger->stockTransaction?->type?->value === 'transfer') {
            return 'internal_transfer';
        }
        if ($ledger->reference_type === 'adjustment') {
            return 'adjustment';
        }

        return 'expense';
    }

    private function fifoValuesByWarehouseItem(Collection $warehouseIds, ?int $warehouseId): Collection
    {
        if (InventorySetting::current()->valuation_method->value !== 'fifo') {
            return collect();
        }

        return StockCostLayer::query()->whereIn('warehouse_id', $warehouseIds)
            ->when($warehouseId, fn (Builder $query) => $query->where('warehouse_id', $warehouseId))
            ->where('remaining_qty', '>', 0)
            ->selectRaw("warehouse_id, item_id, COALESCE(batch_no, '') as batch_key, SUM(remaining_qty * unit_cost) as value")
            ->groupBy('warehouse_id', 'item_id', 'batch_key')->get()
            ->mapWithKeys(fn (StockCostLayer $layer) => [$layer->warehouse_id.'|'.$layer->item_id.'|'.$layer->batch_key => (float) $layer->value]);
    }

    public function items(Collection $warehouseIds): Collection
    {
        $stocksByItem = CurrentStock::query()
            ->whereIn('warehouse_id', $warehouseIds)
            ->where('qty_on_hand', '>', 0)
            ->get(['item_id', 'warehouse_id'])
            ->groupBy('item_id');
        $purchaseWarehousesByItem = DB::table('stock_transaction_details as detail')
            ->join('stock_transactions as transaction', 'transaction.id', '=', 'detail.stock_transaction_id')
            ->where('transaction.type', 'stock_in')
            ->where('transaction.status', 'completed')
            ->whereIn('transaction.destination_warehouse_id', $warehouseIds)
            ->get(['detail.item_id', 'transaction.destination_warehouse_id as warehouse_id'])
            ->groupBy('item_id');
        $itemIds = $stocksByItem->keys()->merge($purchaseWarehousesByItem->keys())->unique();

        return Item::query()
            ->where('is_active', true)
            ->whereIn('id', $itemIds)
            ->orderBy('name')
            ->get(['id', 'code', 'name'])
            ->map(fn (Item $item) => [
                'id' => $item->id,
                'code' => $item->code,
                'name' => $item->name,
                'warehouse_ids' => $stocksByItem->get($item->id, collect())->pluck('warehouse_id')
                    ->merge($purchaseWarehousesByItem->get($item->id, collect())->pluck('warehouse_id'))
                    ->unique()
                    ->values(),
            ]);
    }
}
