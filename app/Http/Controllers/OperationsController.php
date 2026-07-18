<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Delivery;
use App\Models\Item;
use App\Models\Location;
use App\Models\StockAdjustment;
use App\Models\StockOpname;
use App\Models\StockReceipt;
use App\Models\StockRequest;
use App\Models\Supplier;
use App\Models\Uom;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkflowApproval;
use App\Services\InventoryWorkflowService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OperationsController extends Controller
{
    public function index(Request $request, string $module): Response
    {
        abort_unless(in_array($module, ['master-data', 'fulfillment', 'inventory-control']), 404);
        $permissionAllowed = match ($module) {
            'master-data' => $request->user()->hasPermission('master.manage'),
            'inventory-control' => $request->user()->hasPermission('stock.adjust'),
            'fulfillment' => collect(['stock.request', 'stock.ship', 'stock.receive'])->contains(fn ($permission) => $request->user()->hasPermission($permission)),
        };
        abort_unless($permissionAllowed, 403);
        if ($module === 'master-data') {
            abort_unless($request->user()->role === UserRole::Superadmin, 403);
        } elseif ($module !== 'fulfillment') {
            abort_unless($request->user()->role === UserRole::Superadmin || $request->user()->role?->isWarehouseAdmin(), 403);
        }

        $user = $request->user();
        $isSuperadmin = $user->role === UserRole::Superadmin;
        $scopeToUserWarehouse = $module === 'inventory-control' && ! $isSuperadmin;
        $warehouseIds = $scopeToUserWarehouse ? [$user->warehouse_id] : null;

        $base = [
            'module' => $module,
            'items' => Item::where('is_active', true)->orderBy('name')->get(),
            'warehouses' => Warehouse::where('is_active', true)
                ->when($warehouseIds, fn ($query) => $query->whereIn('id', $warehouseIds))
                ->orderBy('name')->get(),
            'suppliers' => Supplier::orderBy('name')->get(),
            'uoms' => Uom::orderBy('name')->get(),
            'locations' => Location::with('warehouse:id,name')
                ->when($warehouseIds, fn ($query) => $query->whereIn('warehouse_id', $warehouseIds))
                ->orderBy('name')->get(),
            'managers' => User::whereIn('role', [UserRole::UnitManager->value, UserRole::Superadmin->value])
                ->when($warehouseIds, fn ($query) => $query->whereIn('warehouse_id', $warehouseIds))
                ->orderBy('name')->get(['id', 'name', 'warehouse_id']),
            'pendingApprovals' => WorkflowApproval::with(['steps' => fn ($query) => $query->orderBy('level')])
                ->where('status', 'pending')->whereNotIn('module', ['purchase_order', 'goods_receipt'])->latest()->get()
                ->filter(fn ($approval) => $request->user()->role === UserRole::Superadmin || $approval->steps->firstWhere('level', $approval->current_level)?->approver_id === $request->user()->id)
                ->values(),
            'fulfillmentAccess' => [
                'canRequest' => $request->user()->role === UserRole::Superadmin || ($request->user()->role === UserRole::UnitUser && $request->user()->warehouse?->type === 'unit'),
                'canPrepare' => $request->user()->role?->isWarehouseAdmin() ?? false,
                'warehouseId' => $request->user()->warehouse_id,
                'isSuperadmin' => $request->user()->role === UserRole::Superadmin,
            ],
        ];

        $stockRequests = StockRequest::with(['details', 'deliveries.details', 'fromWarehouse:id,name', 'toWarehouse:id,name', 'requester:id,name'])
            ->when($request->user()->role !== UserRole::Superadmin, function ($query) use ($request) {
                $user = $request->user();
                if ($user->role?->isWarehouseAdmin()) {
                    return $query->where('from_warehouse_id', $user->warehouse_id);
                }

                return $query->where(fn ($q) => $q->where('to_warehouse_id', $user->warehouse_id)->orWhere('from_warehouse_id', $user->warehouse_id));
            })->latest()->limit(30)->get();
        $stockRequests->each(function (StockRequest $stockRequest) {
            $approval = WorkflowApproval::with('steps')->where('module', 'stock_request')->where('transaction_id', $stockRequest->id)->first();
            $stockRequest->setAttribute('approval_level', $approval?->current_level);
            $stockRequest->setAttribute('unit_approved', $approval?->steps->firstWhere('level', 1)?->status === 'approved');
        });

        $base['records'] = match ($module) {
            'master-data' => [
                'suppliers' => Supplier::latest()->get(),
                'uoms' => Uom::latest()->get(),
                'locations' => Location::with('warehouse:id,name')->latest()->get(),
                'items' => Item::with('category:id,name')->latest()->get(),
            ],
            'fulfillment' => [
                'requests' => $stockRequests,
                'deliveries' => Delivery::with(['details', 'stockRequest'])->whereIn('stock_request_id', $stockRequests->pluck('id'))->latest()->limit(30)->get(),
            ],
            'inventory-control' => [
                'stocks' => CurrentStock::with(['item:id,code,name', 'warehouse:id,name'])
                    ->when($warehouseIds, fn ($query) => $query->whereIn('warehouse_id', $warehouseIds))
                    ->orderBy('warehouse_id')->orderBy('item_id')->get(),
                'adjustments' => StockAdjustment::with('details')
                    ->when($warehouseIds, fn ($query) => $query->whereIn('warehouse_id', $warehouseIds))
                    ->latest()->limit(30)->get(),
            ],
        };

        return Inertia::render('Operations/Index', $base);
    }

    public function supplier(Request $request): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate(['code' => ['required', 'max:50', 'unique:suppliers,code'], 'name' => ['required', 'max:255'], 'phone' => ['nullable', 'max:30'], 'address' => ['nullable']]);
        Supplier::create($data + ['is_active' => true]);

        return back()->with('success', 'Supplier berhasil ditambahkan.');
    }

    public function updateSupplier(Request $request, Supplier $supplier): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate(['code' => ['required', 'max:50', Rule::unique('suppliers', 'code')->ignore($supplier)], 'name' => ['required', 'max:255'], 'phone' => ['nullable', 'max:30'], 'address' => ['nullable'], 'is_active' => ['boolean']]);
        $supplier->update($data);

        return back()->with('success', 'Supplier berhasil diperbarui.');
    }

    public function uom(Request $request): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate(['code' => ['required', 'max:20', 'unique:uoms,code'], 'name' => ['required'], 'type' => ['required', Rule::in(['base', 'small'])]]);
        Uom::create($data + ['is_active' => true]);

        return back()->with('success', 'Satuan berhasil ditambahkan.');
    }

    public function updateUom(Request $request, Uom $uom): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate(['code' => ['required', 'max:20', Rule::unique('uoms', 'code')->ignore($uom)], 'name' => ['required'], 'type' => ['required', Rule::in(['base', 'small'])], 'is_active' => ['boolean']]);
        $uom->update($data);

        return back()->with('success', 'Satuan berhasil diperbarui.');
    }

    public function location(Request $request): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate(['warehouse_id' => ['required', 'exists:warehouses,id'], 'code' => ['required'], 'name' => ['required'], 'type' => ['required', Rule::in(['zone', 'rack', 'bin'])]]);
        Location::create($data + ['is_active' => true]);

        return back()->with('success', 'Lokasi gudang berhasil ditambahkan.');
    }

    public function updateLocation(Request $request, Location $location): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate(['warehouse_id' => ['required', 'exists:warehouses,id'], 'code' => ['required', Rule::unique('locations', 'code')->where('warehouse_id', $request->input('warehouse_id'))->ignore($location)], 'name' => ['required'], 'type' => ['required', Rule::in(['zone', 'rack', 'bin'])], 'is_active' => ['boolean']]);
        $location->update($data);

        return back()->with('success', 'Lokasi gudang berhasil diperbarui.');
    }

    public function item(Request $request): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate($this->itemRules());
        Item::create($data);

        return back()->with('success', 'Item berhasil ditambahkan.');
    }

    public function updateItem(Request $request, Item $item): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate($this->itemRules($item));
        $item->update($data);

        return back()->with('success', 'Item berhasil diperbarui.');
    }

    public function stockRequest(Request $request, InventoryWorkflowService $workflow): RedirectResponse
    {
        $isSuperadmin = $request->user()->role === UserRole::Superadmin;
        $isUnitAdmin = $request->user()->role === UserRole::UnitUser && $request->user()->warehouse?->type === 'unit';
        abort_unless($isSuperadmin || $isUnitAdmin, 403);
        $data = $request->validate([
            'from_warehouse_id' => ['required', 'exists:warehouses,id'],
            'to_warehouse_id' => [$isSuperadmin ? 'required' : 'nullable', 'exists:warehouses,id'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.item_id' => ['required', 'distinct', 'exists:items,id'],
            'details.*.uom_id' => ['nullable', 'exists:uoms,id'],
            'details.*.qty' => ['required', 'numeric', 'gt:0'],
        ]);
        $source = Warehouse::whereKey($data['from_warehouse_id'])->where('type', 'main')->where('is_active', true)->firstOrFail();
        $destinationId = $isSuperadmin ? $data['to_warehouse_id'] : $request->user()->warehouse_id;
        $destination = Warehouse::whereKey($destinationId)->where('type', 'unit')->where('is_active', true)->firstOrFail();
        $unitManager = User::where('role', UserRole::UnitManager)->where('warehouse_id', $destination->id)->first();
        $warehouseManager = User::where('role', UserRole::UnitManager)->where('warehouse_id', $source->id)->first();
        abort_unless($unitManager, 422, 'Manajer unit Anda belum dikonfigurasi.');
        abort_unless($warehouseManager, 422, 'Manajer gudang sumber belum dikonfigurasi.');
        DB::transaction(function () use ($data, $request, $workflow, $destination) {
            $source = Warehouse::findOrFail($data['from_warehouse_id']);
            $unitManager = User::where('role', UserRole::UnitManager)->where('warehouse_id', $destination->id)->firstOrFail();
            $warehouseManager = User::where('role', UserRole::UnitManager)->where('warehouse_id', $source->id)->firstOrFail();
            $stockRequest = StockRequest::create(['number' => $this->number('REQ'), 'type' => 'to_unit', 'from_warehouse_id' => $source->id, 'to_warehouse_id' => $destination->id, 'request_date' => now(), 'notes' => $data['notes'] ?? null, 'requested_by' => $request->user()->id, 'assigned_approver_id' => $unitManager->id]);
            $stockRequest->details()->createMany(collect($data['details'])->map(fn (array $detail) => [
                'item_id' => $detail['item_id'],
                'uom_id' => $detail['uom_id'] ?? null,
                'qty_requested' => $detail['qty'],
            ])->all());
            $workflow->requestApproval('stock_request', $stockRequest, $request->user(), [$unitManager->id, $warehouseManager->id]);
        });

        return back()->with('success', 'Request stok diajukan ke manajer unit.');
    }

    public function prepareStockRequest(Request $request, StockRequest $stockRequest, InventoryWorkflowService $workflow): RedirectResponse
    {
        abort_unless($request->user()->role?->isWarehouseAdmin() && $request->user()->warehouse_id === $stockRequest->from_warehouse_id, 403);
        $workflow->prepareRequest($stockRequest->load('details'), $request->user());

        return back()->with('success', 'Barang berhasil disiapkan dan diteruskan ke manajer gudang.');
    }

    public function delivery(Request $request, InventoryWorkflowService $workflow): RedirectResponse
    {
        $this->authorizeWarehouseOperator($request);
        $data = $request->validate(['stock_request_id' => ['required', 'exists:stock_requests,id'], 'notes' => ['nullable']]);
        $stockRequest = StockRequest::with('details')->findOrFail($data['stock_request_id']);
        abort_unless($stockRequest->status === 'approved', 422, 'Permintaan belum disetujui.');
        $delivery = DB::transaction(function () use ($stockRequest, $request, $data) {
            $delivery = Delivery::create(['number' => $this->number('DO'), 'stock_request_id' => $stockRequest->id, 'delivery_date' => now(), 'notes' => $data['notes'] ?? null, 'delivered_by' => $request->user()->id]);
            foreach ($stockRequest->details as $detail) {
                $delivery->details()->create(['stock_request_detail_id' => $detail->id, 'item_id' => $detail->item_id, 'uom_id' => $detail->uom_id, 'qty_delivered' => $detail->qty_approved, 'batch_no' => $detail->batch_no]);
            }

            return $delivery;
        });
        $workflow->ship($delivery->load('details'));

        return back()->with('success', 'Barang dikirim dan stok sumber telah berkurang.');
    }

    public function receipt(Request $request, InventoryWorkflowService $workflow): RedirectResponse
    {
        $data = $request->validate(['delivery_id' => ['required', 'exists:deliveries,id'], 'notes' => ['nullable']]);
        $delivery = Delivery::with('details')->findOrFail($data['delivery_id']);
        abort_unless($delivery->status === 'shipped', 422, 'Delivery belum dikirim atau sudah diterima.');
        $receipt = DB::transaction(function () use ($delivery, $request, $data) {
            $receipt = StockReceipt::create(['number' => $this->number('RCV'), 'delivery_id' => $delivery->id, 'receipt_date' => now(), 'notes' => $data['notes'] ?? null, 'received_by' => $request->user()->id]);
            foreach ($delivery->details as $detail) {
                $receipt->details()->create(['delivery_detail_id' => $detail->id, 'item_id' => $detail->item_id, 'uom_id' => $detail->uom_id, 'qty_received' => $detail->qty_delivered, 'batch_no' => $detail->batch_no]);
            }

            return $receipt;
        });
        $workflow->receive($receipt->load('details'));

        return back()->with('success', 'Penerimaan selesai dan stok tujuan telah bertambah.');
    }

    public function adjustment(Request $request, InventoryWorkflowService $workflow): RedirectResponse
    {
        $this->authorizeWarehouseOperator($request);
        $data = $request->validate([
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'type' => ['required', Rule::in(['damaged', 'expired', 'correction', 'opening', 'waste', 'return'])],
            'reason' => ['required', 'string', 'max:1000'],
            'approver_id' => ['required', 'exists:users,id'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.item_id' => ['required', 'distinct', 'exists:items,id'],
            'details.*.uom_id' => ['nullable', 'exists:uoms,id'],
            'details.*.qty' => ['required', 'numeric', 'not_in:0'],
            'details.*.unit_price' => ['nullable', 'numeric', 'min:0'],
            'details.*.batch_no' => ['nullable', 'string', 'max:100'],
            'details.*.location_id' => ['nullable', 'exists:locations,id'],
        ]);
        $data['warehouse_id'] = $this->resolveOperatorWarehouse($request, (int) $data['warehouse_id']);
        $this->validateWarehouseApprover($data['approver_id'], $data['warehouse_id']);
        DB::transaction(function () use ($data, $request, $workflow) {
            $adjustment = StockAdjustment::create(['number' => $this->number('ADJ'), 'type' => $data['type'], 'warehouse_id' => $data['warehouse_id'], 'adjustment_date' => now(), 'reason' => $data['reason'], 'created_by' => $request->user()->id, 'assigned_approver_id' => $data['approver_id']]);
            $adjustment->details()->createMany(collect($data['details'])->map(fn (array $detail) => [
                'item_id' => $detail['item_id'], 'uom_id' => $detail['uom_id'] ?? null,
                'qty_adjustment' => $detail['qty'], 'unit_price' => $detail['unit_price'] ?? 0,
                'batch_no' => $detail['batch_no'] ?? null, 'location_id' => $detail['location_id'] ?? null,
            ])->all());
            $workflow->requestApproval('stock_adjustment', $adjustment, $request->user(), [$data['approver_id']]);
        });

        return back()->with('success', 'Adjustment diajukan. Saldo berubah setelah approval.');
    }

    public function opname(Request $request, InventoryWorkflowService $workflow): RedirectResponse
    {
        $this->authorizeWarehouseOperator($request);
        $data = $request->validate([
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'approver_id' => ['required', 'exists:users,id'], 'notes' => ['nullable', 'max:1000'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.item_id' => ['required', 'distinct', 'exists:items,id'],
            'details.*.uom_id' => ['nullable', 'exists:uoms,id'],
            'details.*.qty' => ['required', 'numeric', 'min:0'],
        ]);
        $data['warehouse_id'] = $this->resolveOperatorWarehouse($request, (int) $data['warehouse_id']);
        $this->validateWarehouseApprover($data['approver_id'], $data['warehouse_id']);
        $availableItemIds = CurrentStock::where('warehouse_id', $data['warehouse_id'])
            ->where('qty_on_hand', '>', 0)
            ->whereIn('item_id', collect($data['details'])->pluck('item_id'))
            ->pluck('item_id')->unique();
        abort_unless(
            $availableItemIds->count() === count($data['details']),
            422,
            'Item stock opname harus tersedia pada gudang yang dipilih.',
        );
        DB::transaction(function () use ($data, $request, $workflow) {
            $opname = StockOpname::create(['number' => $this->number('OPN'), 'warehouse_id' => $data['warehouse_id'], 'opname_date' => now(), 'status' => 'waiting_approval', 'notes' => $data['notes'] ?? null, 'created_by' => $request->user()->id, 'assigned_approver_id' => $data['approver_id']]);
            $adjustment = StockAdjustment::create(['number' => $this->number('ADJ-OPN'), 'stock_opname_id' => $opname->id, 'type' => 'opname', 'warehouse_id' => $data['warehouse_id'], 'adjustment_date' => now(), 'status' => 'draft', 'reason' => 'Selisih '.$opname->number, 'created_by' => $request->user()->id, 'assigned_approver_id' => $data['approver_id']]);
            foreach ($data['details'] as $detail) {
                $systemQty = (float) CurrentStock::where('warehouse_id', $data['warehouse_id'])->where('item_id', $detail['item_id'])->sum('qty_on_hand');
                $diff = (float) $detail['qty'] - $systemQty;
                $opname->details()->create(['item_id' => $detail['item_id'], 'uom_id' => $detail['uom_id'] ?? null, 'system_qty' => $systemQty, 'count_qty' => $detail['qty'], 'diff_qty' => $diff]);
                $adjustment->details()->create(['item_id' => $detail['item_id'], 'uom_id' => $detail['uom_id'] ?? null, 'qty_adjustment' => $diff, 'unit_price' => 0]);
            }
            $workflow->requestApproval('stock_adjustment', $adjustment, $request->user(), [$data['approver_id']]);
        });

        return back()->with('success', 'Hasil stock opname dan adjustment selisih telah diajukan.');
    }

    public function approval(Request $request, WorkflowApproval $approval, InventoryWorkflowService $workflow): RedirectResponse
    {
        $data = $request->validate(['action' => ['required', Rule::in(['approved', 'rejected'])], 'remarks' => ['nullable', 'max:1000']]);
        $workflow->act($approval, $request->user(), $data['action'], $data['remarks'] ?? null);

        return back()->with('success', $data['action'] === 'approved' ? 'Approval berhasil diproses.' : 'Dokumen berhasil ditolak.');
    }

    private function documentRules(array $extra): array
    {
        return $extra + ['item_id' => ['required', 'exists:items,id'], 'uom_id' => ['nullable', 'exists:uoms,id'], 'qty' => ['required', 'numeric', 'not_in:0'], 'unit_price' => ['required', 'numeric', 'min:0'], 'notes' => ['nullable', 'max:1000']];
    }

    private function number(string $prefix): string
    {
        return $prefix.'-'.now()->format('Ymd-His').'-'.str_pad((string) random_int(1, 999), 3, '0', STR_PAD_LEFT);
    }

    private function authorizeWarehouseOperator(Request $request): void
    {
        abort_unless($request->user()->role === UserRole::Superadmin || $request->user()->role?->isWarehouseAdmin(), 403);
    }

    private function resolveOperatorWarehouse(Request $request, int $requestedWarehouseId): int
    {
        if ($request->user()->role === UserRole::Superadmin) {
            return $requestedWarehouseId;
        }

        abort_unless($request->user()->warehouse_id, 403, 'Akun belum terhubung dengan gudang.');

        return (int) $request->user()->warehouse_id;
    }

    private function validateWarehouseApprover(int $approverId, int $warehouseId): void
    {
        abort_unless(
            User::whereKey($approverId)->where('role', UserRole::UnitManager)->where('warehouse_id', $warehouseId)->exists(),
            422,
            'Approver harus merupakan manajer dari gudang yang dipilih.',
        );
    }

    private function authorizeSuperadmin(Request $request): void
    {
        abort_unless($request->user()->role === UserRole::Superadmin, 403);
    }

    private function itemRules(?Item $item = null): array
    {
        return [
            'code' => ['required', 'max:50', Rule::unique('items', 'code')->ignore($item)],
            'name' => ['required', 'max:255'],
            'base_uom' => ['required', 'max:20'],
            'warehouse_type' => ['required', Rule::in(['dry', 'wet', 'both'])],
            'min_stock' => ['required', 'numeric', 'min:0'],
            'reorder_point' => ['required', 'numeric', 'min:0'],
            'issue_method' => ['required', Rule::in(['manual', 'fifo', 'fefo'])],
            'has_batch' => ['boolean'],
            'has_expired' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }
}
