<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Delivery;
use App\Models\Item;
use App\Models\ItemUom;
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
use App\Services\ItemImportWorkbook;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class OperationsController extends Controller
{
    public function deliveryNote(Request $request, StockRequest $stockRequest)
    {
        $user = $request->user()->load('warehouse');
        $approval = WorkflowApproval::with(['steps.actor:id,name', 'steps.approver:id,name'])
            ->where('module', 'stock_request')
            ->where('transaction_id', $stockRequest->id)
            ->where('status', 'approved')
            ->firstOrFail();
        $finalStep = $approval->steps->sortByDesc('level')->first();
        abort_unless(
            $user->role === UserRole::UnitManager
            && $user->warehouse?->type === 'main'
            && $finalStep?->stage_key === 'warehouse_manager'
            && $finalStep->status === 'approved'
            && $finalStep->acted_by === $user->id,
            403,
        );
        $stockRequest->load([
            'details.item:id,code,name,base_uom', 'details.uom:id,code,name',
            'fromWarehouse:id,code,name', 'toWarehouse:id,code,name', 'requester:id,name',
            'deliveries.details.item:id,code,name,base_uom', 'deliveries.details.uom:id,code,name',
        ]);
        $delivery = $stockRequest->deliveries->sortByDesc('id')->firstOrFail();
        $options = new Options;
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isRemoteEnabled', false);
        $pdf = new Dompdf($options);
        $pdf->loadHtml(view('documents.delivery-note', compact('stockRequest', 'delivery', 'finalStep'))->render());
        $pdf->setPaper('A4', 'portrait');
        $pdf->render();
        $delivery->increment('download_count');

        return response($pdf->output(), 200, [
            'Content-Type' => 'application/pdf',
            'Content-Disposition' => 'attachment; filename="surat-jalan-'.$delivery->number.'.pdf"',
        ]);
    }

    public function stockRequests(Request $request): Response
    {
        abort_unless(
            collect(['stock.request', 'stock.ship', 'stock.receive'])
                ->contains(fn ($permission) => $request->user()->hasPermission($permission)),
            403,
        );

        $user = $request->user();
        $query = StockRequest::query()
            ->with([
                'details.item:id,code,name,base_uom',
                'details.uom:id,code,name',
                'fromWarehouse:id,name',
                'toWarehouse:id,name',
                'requester:id,name',
            ])
            ->withCount('details')
            ->withSum('details as total_qty_requested', 'qty_requested')
            ->when($user->role !== UserRole::Superadmin, function ($query) use ($user) {
                if ($user->role?->isWarehouseAdmin()) {
                    return $query->where('from_warehouse_id', $user->warehouse_id);
                }

                return $query->where(fn ($query) => $query
                    ->where('to_warehouse_id', $user->warehouse_id)
                    ->orWhere('from_warehouse_id', $user->warehouse_id));
            })
            ->when($request->filled('search'), function ($query) use ($request) {
                $search = trim($request->string('search')->toString());
                $query->where(fn ($query) => $query
                    ->where('number', 'like', "%{$search}%")
                    ->orWhereHas('details.item', fn ($query) => $query
                        ->where('code', 'like', "%{$search}%")
                        ->orWhere('name', 'like', "%{$search}%")));
            })
            ->when($request->filled('unit_id'), fn ($query) => $query->where('to_warehouse_id', $request->integer('unit_id')))
            ->when($request->filled('warehouse_id'), fn ($query) => $query->where('from_warehouse_id', $request->integer('warehouse_id')))
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('request_date', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('request_date', '<=', $request->date('date_to')))
            ->latest('request_date')
            ->latest('id');

        $stockRequests = $query->paginate(10)->withQueryString();
        $approvals = WorkflowApproval::with('steps:id,workflow_approval_id,level,stage_key,stage_label,status')
            ->where('module', 'stock_request')
            ->whereIn('transaction_id', $stockRequests->getCollection()->pluck('id'))
            ->get()
            ->keyBy('transaction_id');
        $stockRequests->getCollection()->each(fn (StockRequest $stockRequest) => $stockRequest
            ->setAttribute('approval', $approvals->get($stockRequest->id)));

        $visibleRequestQuery = StockRequest::query()
            ->when($user->role !== UserRole::Superadmin, function ($query) use ($user) {
                if ($user->role?->isWarehouseAdmin()) {
                    return $query->where('from_warehouse_id', $user->warehouse_id);
                }

                return $query->where(fn ($query) => $query
                    ->where('to_warehouse_id', $user->warehouse_id)
                    ->orWhere('from_warehouse_id', $user->warehouse_id));
            });

        return Inertia::render('StockRequests/Index', [
            'requests' => $stockRequests,
            'filters' => $request->only(['search', 'unit_id', 'warehouse_id', 'status', 'date_from', 'date_to']),
            'units' => Warehouse::query()
                ->whereIn('id', (clone $visibleRequestQuery)->distinct()->pluck('to_warehouse_id'))
                ->orderBy('name')->get(['id', 'name']),
            'sourceWarehouses' => Warehouse::query()
                ->whereIn('id', (clone $visibleRequestQuery)->distinct()->pluck('from_warehouse_id'))
                ->orderBy('name')->get(['id', 'name']),
        ]);
    }

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
            'initialMaster' => $module === 'master-data' && in_array($request->query('master'), ['supplier', 'item', 'location', 'uom'], true)
                ? $request->query('master')
                : 'supplier',
            'items' => Item::with(['itemUoms.uom:id,code,name'])
                ->where('is_active', true)->orderBy('name')->get(),
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
            'pendingApprovals' => WorkflowApproval::with(['steps' => fn ($query) => $query->with(['approver:id,name', 'actor:id,name'])->orderBy('level')])
                ->where('status', 'pending')->whereNotIn('module', ['purchase_order', 'goods_receipt'])->latest()->get()
                ->filter(fn ($approval) => $request->user()->role === UserRole::Superadmin || $approval->steps->firstWhere('level', $approval->current_level)?->approver_id === $request->user()->id)
                ->values(),
            'approvalHistory' => WorkflowApproval::query()
                ->with(['steps' => fn ($query) => $query
                    ->where('acted_by', $request->user()->id)
                    ->with(['approver:id,name', 'actor:id,name'])
                    ->orderByDesc('acted_at')])
                ->where('module', 'stock_request')
                ->whereHas('steps', fn ($query) => $query->where('acted_by', $request->user()->id))
                ->latest('updated_at')
                ->limit(30)
                ->get(),
            'fulfillmentAccess' => [
                'canRequest' => $request->user()->role === UserRole::Superadmin || ($request->user()->role === UserRole::UnitUser && $request->user()->warehouse?->type === 'unit'),
                'canPrepare' => $request->user()->role?->isWarehouseAdmin() ?? false,
                'warehouseId' => $request->user()->warehouse_id,
                'isSuperadmin' => $request->user()->role === UserRole::Superadmin,
            ],
            'requestStockItems' => $module === 'fulfillment'
                ? CurrentStock::query()
                    ->with([
                        'item:id,code,name,base_uom',
                        'item.itemUoms' => fn ($query) => $query->where('is_base', true)->with('uom:id,code,name'),
                        'uom:id,code,name',
                    ])
                    ->whereHas('warehouse', fn ($query) => $query->where('type', 'main')->where('is_active', true))
                    ->whereRaw('(qty_on_hand - qty_reserved) > 0')
                    ->get(['id', 'warehouse_id', 'item_id', 'uom_id', 'qty_on_hand', 'qty_reserved'])
                    ->groupBy(fn (CurrentStock $stock) => $stock->warehouse_id.'-'.$stock->item_id)
                    ->map(function ($stocks) {
                        /** @var CurrentStock $stock */
                        $stock = $stocks->first();
                        $baseUom = $stock->item->itemUoms->first()?->uom;

                        return [
                            'warehouse_id' => $stock->warehouse_id,
                            'item_id' => $stock->item_id,
                            'item' => $stock->item->only(['id', 'code', 'name', 'base_uom']),
                            'uom_id' => $stock->uom_id ?? $baseUom?->id,
                            'uom_code' => $stock->uom?->code ?? $baseUom?->code ?? $stock->item->base_uom,
                            'uom_name' => $stock->uom?->name ?? $baseUom?->name ?? $stock->item->base_uom,
                            'qty_available' => $stocks->sum(fn (CurrentStock $row) => $row->qty_available),
                        ];
                    })
                    ->values()
                : [],
        ];

        $stockRequests = StockRequest::with([
            'details.item:id,code,name,base_uom',
            'details.uom:id,code,name',
            'deliveries.details',
            'fromWarehouse:id,name',
            'toWarehouse:id,name',
            'requester:id,name',
        ])
            ->when($request->user()->role !== UserRole::Superadmin, function ($query) use ($request) {
                $user = $request->user();
                if ($user->role?->isWarehouseAdmin()) {
                    return $query->where('from_warehouse_id', $user->warehouse_id);
                }

                return $query->where(fn ($q) => $q->where('to_warehouse_id', $user->warehouse_id)->orWhere('from_warehouse_id', $user->warehouse_id));
            })->latest()->limit(30)->get();
        $stockRequests->each(function (StockRequest $stockRequest) {
            $approval = WorkflowApproval::with(['steps' => fn ($query) => $query->with(['approver:id,name', 'actor:id,name'])->orderBy('level')])
                ->where('module', 'stock_request')->where('transaction_id', $stockRequest->id)->first();
            $stockRequest->setAttribute('approval_level', $approval?->current_level);
            $stockRequest->setAttribute('unit_approved', $approval?->steps->firstWhere('stage_key', 'unit_manager')?->status === 'approved');
            $stockRequest->setAttribute('approval', $approval);
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
                'adjustments' => StockAdjustment::with([
                    'details.item:id,code,name',
                    'warehouse:id,name',
                    'creator:id,name',
                    'assignedApprover:id,name',
                    'opname:id,number,status',
                ])
                    ->when($warehouseIds, fn ($query) => $query->whereIn('warehouse_id', $warehouseIds))
                    ->latest()->limit(30)->get(),
                'opnames' => StockOpname::with([
                    'details.item:id,code,name',
                    'warehouse:id,name',
                    'creator:id,name',
                    'assignedApprover:id,name',
                ])
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
        $item = Item::create($data + ['reorder_point' => 0, 'valuation_method' => 'moving_average']);
        $this->syncItemBaseUom($item);

        return back()->with('success', 'Item berhasil ditambahkan.');
    }

    public function updateItem(Request $request, Item $item): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $request->validate($this->itemRules($item));
        $item->update($data + ['reorder_point' => 0]);
        $this->syncItemBaseUom($item);

        return back()->with('success', 'Item berhasil diperbarui.');
    }

    public function importItems(Request $request, ItemImportWorkbook $workbook): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $request->validate(['file' => ['required', 'file', 'mimes:xlsx,csv,txt', 'max:2048']]);
        $file = $request->file('file');
        $isXlsx = strtolower($file->getClientOriginalExtension()) === 'xlsx';

        if ($isXlsx) {
            try {
                $rows = $workbook->rows($file->getRealPath());
            } catch (\RuntimeException $exception) {
                throw ValidationException::withMessages(['file' => $exception->getMessage()]);
            }
            $headers = array_keys($rows[0] ?? []);
        } else {
            $handle = fopen($file->getRealPath(), 'r');
            abort_unless($handle !== false, 422, 'File impor tidak dapat dibaca.');
            $headers = array_map(fn ($header) => strtolower(trim((string) $header)), fgetcsv($handle) ?: []);
            $rows = [];
            while (($values = fgetcsv($handle)) !== false) {
                $values = array_pad($values, count($headers), null);
                $row = array_combine($headers, array_slice($values, 0, count($headers)));
                if (! collect($row)->filter(fn ($value) => trim((string) $value) !== '')->isEmpty()) {
                    $rows[] = $row;
                }
            }
            fclose($handle);
        }

        $requiredHeaders = ['name', 'base_uom', 'warehouse_type'];
        if (array_diff($requiredHeaders, $headers)) {
            throw ValidationException::withMessages(['file' => 'Kolom wajib: name, base_uom, warehouse_type. Gunakan template yang tersedia.']);
        }

        if (count($rows) > 1000) {
            throw ValidationException::withMessages(['file' => 'Maksimal 1.000 item dalam satu kali impor.']);
        }

        if ($rows === []) {
            throw ValidationException::withMessages(['file' => 'File tidak memiliki data item.']);
        }

        DB::transaction(function () use ($rows): void {
            foreach ($rows as $index => $row) {
                $normalized = [
                    'name' => trim((string) ($row['name'] ?? '')),
                    'base_uom' => strtoupper(trim((string) ($row['base_uom'] ?? ''))),
                    'warehouse_type' => strtolower(trim((string) ($row['warehouse_type'] ?? ''))),
                    'min_stock' => ! isset($row['min_stock']) || $row['min_stock'] === '' ? 0 : $row['min_stock'],
                    'issue_method' => strtolower(trim((string) ($row['issue_method'] ?? 'fifo'))),
                    'has_batch' => $this->csvBoolean($row['has_batch'] ?? true),
                    'has_expired' => $this->csvBoolean($row['has_expired'] ?? false),
                    'is_active' => $this->csvBoolean($row['is_active'] ?? true),
                ];
                $validator = Validator::make($normalized, [
                    'name' => ['required', 'max:255'],
                    'base_uom' => ['required', Rule::exists('uoms', 'code')->where('is_active', true)],
                    'warehouse_type' => ['required', Rule::in(['dry', 'wet', 'both'])],
                    'min_stock' => ['numeric', 'min:0'],
                    'issue_method' => ['required', Rule::in(['manual', 'fifo', 'fefo'])],
                    'has_batch' => ['boolean'], 'has_expired' => ['boolean'], 'is_active' => ['boolean'],
                ]);
                if ($validator->fails()) {
                    throw ValidationException::withMessages(['file' => 'Baris '.($index + 2).': '.$validator->errors()->first()]);
                }
                $item = Item::create($normalized + [
                    'code' => $this->nextItemCode($normalized['warehouse_type']),
                    'reorder_point' => 0, 'valuation_method' => 'moving_average',
                ]);
                $this->syncItemBaseUom($item);
            }
        });

        return back()->with('success', count($rows).' item berhasil diimpor.');
    }

    public function itemImportTemplate(Request $request, ItemImportWorkbook $workbook)
    {
        $this->authorizeSuperadmin($request);
        $uoms = Uom::where('is_active', true)->orderBy('name')->get(['code', 'name'])->toArray();

        return response($workbook->create($uoms), 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="template-impor-item.xlsx"',
        ]);
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
        $warehouseAdmin = User::whereIn('role', [UserRole::WarehouseAdminDry, UserRole::WarehouseAdminWet])->where('warehouse_id', $source->id)->first();
        $warehouseManager = User::where('role', UserRole::UnitManager)->where('warehouse_id', $source->id)->first();
        abort_unless($unitManager, 422, 'Manajer unit Anda belum dikonfigurasi.');
        abort_unless($warehouseAdmin, 422, 'Admin gudang sumber belum dikonfigurasi.');
        abort_unless($warehouseManager, 422, 'Manajer gudang sumber belum dikonfigurasi.');
        $availableStocks = CurrentStock::query()
            ->where('warehouse_id', $source->id)
            ->whereIn('item_id', collect($data['details'])->pluck('item_id'))
            ->whereRaw('(qty_on_hand - qty_reserved) > 0')
            ->get()
            ->groupBy('item_id');
        foreach ($data['details'] as $detail) {
            $stocks = $availableStocks->get((int) $detail['item_id'], collect());
            abort_if($stocks->isEmpty(), 422, 'Item yang dipilih tidak tersedia pada gudang sumber.');
            if (! empty($detail['uom_id'])) {
                $validUomIds = $stocks->pluck('uom_id')->filter()->map(fn ($id) => (int) $id);
                $baseUomId = ItemUom::where('item_id', $detail['item_id'])->where('is_base', true)->value('uom_id');
                abort_unless($validUomIds->contains((int) $detail['uom_id']) || (int) $baseUomId === (int) $detail['uom_id'], 422, 'Satuan item tidak sesuai dengan stok gudang sumber.');
            }
            abort_if((float) $detail['qty'] > $stocks->sum(fn (CurrentStock $stock) => $stock->qty_available), 422, 'Jumlah request melebihi stok tersedia pada gudang sumber.');
        }
        DB::transaction(function () use ($data, $request, $workflow, $destination) {
            $source = Warehouse::findOrFail($data['from_warehouse_id']);
            $unitManager = User::where('role', UserRole::UnitManager)->where('warehouse_id', $destination->id)->firstOrFail();
            $warehouseAdmin = User::whereIn('role', [UserRole::WarehouseAdminDry, UserRole::WarehouseAdminWet])->where('warehouse_id', $source->id)->firstOrFail();
            $warehouseManager = User::where('role', UserRole::UnitManager)->where('warehouse_id', $source->id)->firstOrFail();
            $stockRequest = StockRequest::create(['number' => $this->number('REQ'), 'type' => 'to_unit', 'from_warehouse_id' => $source->id, 'to_warehouse_id' => $destination->id, 'request_date' => now(), 'notes' => $data['notes'] ?? null, 'requested_by' => $request->user()->id, 'assigned_approver_id' => $unitManager->id]);
            $stockRequest->details()->createMany(collect($data['details'])->map(fn (array $detail) => [
                'item_id' => $detail['item_id'],
                'uom_id' => $detail['uom_id'] ?? null,
                'qty_requested' => $detail['qty'],
            ])->all());
            $workflow->requestApproval('stock_request', $stockRequest, $request->user(), [
                ['stage_key' => 'requester', 'stage_label' => 'Pengajuan user unit', 'approver_id' => $request->user()->id, 'status' => 'approved', 'remarks' => 'Request stok diajukan.', 'acted_by' => $request->user()->id, 'acted_at' => now()],
                ['stage_key' => 'unit_manager', 'stage_label' => 'Approval manajer unit', 'approver_id' => $unitManager->id],
                ['stage_key' => 'warehouse_admin', 'stage_label' => 'Approval admin '.$source->name, 'approver_id' => $warehouseAdmin->id],
                ['stage_key' => 'warehouse_manager', 'stage_label' => 'Approval manajer '.$source->name, 'approver_id' => $warehouseManager->id],
            ]);
        });

        return back()->with('success', 'Request stok diajukan ke manajer unit.');
    }

    public function prepareStockRequest(Request $request, StockRequest $stockRequest, InventoryWorkflowService $workflow): RedirectResponse
    {
        abort_unless($request->user()->role?->isWarehouseAdmin() && $request->user()->warehouse_id === $stockRequest->from_warehouse_id, 403);
        $approval = WorkflowApproval::where('module', 'stock_request')->where('transaction_id', $stockRequest->id)->firstOrFail();
        $workflow->act($approval, $request->user(), 'approved', 'Barang tersedia dan telah disiapkan oleh admin gudang.');

        return back()->with('success', 'Approval admin gudang berhasil dan request diteruskan ke manajer gudang.');
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
            'details' => ['required', 'array', 'min:1'],
            'details.*.item_id' => ['required', 'distinct', 'exists:items,id'],
            'details.*.uom_id' => ['nullable', 'exists:uoms,id'],
            'details.*.qty' => ['required', 'numeric', 'not_in:0'],
            'details.*.batch_no' => ['nullable', 'string', 'max:100'],
            'details.*.location_id' => ['nullable', 'exists:locations,id'],
        ]);
        $data['warehouse_id'] = $this->resolveOperatorWarehouse($request, (int) $data['warehouse_id']);
        $manager = $this->warehouseManager($data['warehouse_id']);
        DB::transaction(function () use ($data, $request, $workflow, $manager) {
            $adjustment = StockAdjustment::create(['number' => $this->number('ADJ'), 'type' => $data['type'], 'warehouse_id' => $data['warehouse_id'], 'adjustment_date' => now(), 'reason' => $data['reason'], 'created_by' => $request->user()->id, 'assigned_approver_id' => $manager->id]);
            foreach ($data['details'] as $detail) {
                [$baseQty, $baseUomId] = $this->quantityInBaseUom(
                    (int) $detail['item_id'],
                    isset($detail['uom_id']) ? (int) $detail['uom_id'] : null,
                    (float) $detail['qty'],
                );
                $adjustment->details()->create([
                    'item_id' => $detail['item_id'],
                    'uom_id' => $baseUomId,
                    'qty_adjustment' => $baseQty,
                    'unit_price' => null,
                    'batch_no' => $detail['batch_no'] ?? null,
                    'location_id' => $detail['location_id'] ?? null,
                ]);
            }
            $workflow->requestApproval('stock_adjustment', $adjustment, $request->user(), [[
                'stage_key' => 'warehouse_manager',
                'stage_label' => 'Persetujuan manajer '.$manager->warehouse->name,
                'approver_id' => $manager->id,
            ]]);
        });

        return back()->with('success', 'Adjustment diajukan. Saldo berubah setelah approval.');
    }

    public function opname(Request $request, InventoryWorkflowService $workflow): RedirectResponse
    {
        $this->authorizeWarehouseOperator($request);
        $data = $request->validate([
            'warehouse_id' => ['required', 'exists:warehouses,id'],
            'notes' => ['nullable', 'max:1000'],
            'details' => ['required', 'array', 'min:1'],
            'details.*.item_id' => ['required', 'distinct', 'exists:items,id'],
            'details.*.uom_id' => ['nullable', 'exists:uoms,id'],
            'details.*.qty' => ['required', 'numeric', 'min:0'],
        ]);
        $data['warehouse_id'] = $this->resolveOperatorWarehouse($request, (int) $data['warehouse_id']);
        $manager = $this->warehouseManager($data['warehouse_id']);
        $availableItemIds = CurrentStock::where('warehouse_id', $data['warehouse_id'])
            ->where('qty_on_hand', '>', 0)
            ->whereIn('item_id', collect($data['details'])->pluck('item_id'))
            ->pluck('item_id')->unique();
        abort_unless(
            $availableItemIds->count() === count($data['details']),
            422,
            'Item stock opname harus tersedia pada gudang yang dipilih.',
        );
        DB::transaction(function () use ($data, $request, $workflow, $manager) {
            $opname = StockOpname::create(['number' => $this->number('OPN'), 'warehouse_id' => $data['warehouse_id'], 'opname_date' => now(), 'status' => 'waiting_approval', 'notes' => $data['notes'] ?? null, 'created_by' => $request->user()->id, 'assigned_approver_id' => $manager->id]);
            $adjustment = StockAdjustment::create(['number' => $this->number('ADJ-OPN'), 'stock_opname_id' => $opname->id, 'type' => 'opname', 'warehouse_id' => $data['warehouse_id'], 'adjustment_date' => now(), 'status' => 'draft', 'reason' => 'Selisih '.$opname->number, 'created_by' => $request->user()->id, 'assigned_approver_id' => $manager->id]);
            foreach ($data['details'] as $detail) {
                [$countQty, $baseUomId] = $this->quantityInBaseUom(
                    (int) $detail['item_id'],
                    isset($detail['uom_id']) ? (int) $detail['uom_id'] : null,
                    (float) $detail['qty'],
                );
                $systemQty = (float) CurrentStock::where('warehouse_id', $data['warehouse_id'])->where('item_id', $detail['item_id'])->sum('qty_on_hand');
                $diff = $countQty - $systemQty;
                $opname->details()->create(['item_id' => $detail['item_id'], 'uom_id' => $baseUomId, 'system_qty' => $systemQty, 'count_qty' => $countQty, 'diff_qty' => $diff]);
                $adjustment->details()->create(['item_id' => $detail['item_id'], 'uom_id' => $baseUomId, 'qty_adjustment' => $diff, 'unit_price' => null]);
            }
            $workflow->requestApproval('stock_adjustment', $adjustment, $request->user(), [[
                'stage_key' => 'warehouse_manager',
                'stage_label' => 'Persetujuan hasil opname oleh manajer '.$manager->warehouse->name,
                'approver_id' => $manager->id,
            ]]);
        });

        return back()->with('success', 'Hasil stock opname dan adjustment selisih telah diajukan.');
    }

    public function approval(Request $request, WorkflowApproval $approval, InventoryWorkflowService $workflow): RedirectResponse
    {
        $data = $request->validate([
            'action' => ['required', Rule::in(['approved', 'rejected'])],
            'remarks' => [Rule::requiredIf($request->input('action') === 'rejected'), 'nullable', 'string', 'min:5', 'max:1000'],
        ]);
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

    private function warehouseManager(int $warehouseId): User
    {
        $manager = User::with('warehouse:id,name')
            ->where('role', UserRole::UnitManager)
            ->where('warehouse_id', $warehouseId)
            ->first();

        abort_unless($manager, 422, 'Manajer untuk gudang yang dipilih belum dikonfigurasi.');

        return $manager;
    }

    /**
     * @return array{0: float, 1: int|null}
     */
    private function quantityInBaseUom(int $itemId, ?int $selectedUomId, float $quantity): array
    {
        $itemUoms = ItemUom::where('item_id', $itemId)->get();
        if ($itemUoms->isEmpty()) {
            abort_if($selectedUomId, 422, 'Satuan yang dipilih belum dikonfigurasi untuk item.');

            return [$quantity, null];
        }

        $selected = $selectedUomId
            ? $itemUoms->firstWhere('uom_id', $selectedUomId)
            : $itemUoms->firstWhere('is_base', true);
        $base = $itemUoms->firstWhere('is_base', true);
        abort_unless($selected && $base, 422, 'Konversi satuan dasar item belum dikonfigurasi.');

        return [$quantity * (float) $selected->conversion_factor, (int) $base->uom_id];
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
            'base_uom' => ['required', Rule::exists('uoms', 'code')->where('is_active', true)],
            'warehouse_type' => ['required', Rule::in(['dry', 'wet', 'both'])],
            'min_stock' => ['required', 'numeric', 'min:0'],
            'issue_method' => ['required', Rule::in(['manual', 'fifo', 'fefo'])],
            'has_batch' => ['boolean'],
            'has_expired' => ['boolean'],
            'is_active' => ['boolean'],
        ];
    }

    private function csvBoolean(mixed $value): bool
    {
        return in_array(strtolower(trim((string) $value)), ['1', 'true', 'ya', 'yes', 'aktif'], true);
    }

    private function nextItemCode(string $warehouseType): string
    {
        $prefix = 'BRG-'.strtoupper($warehouseType).'-';
        $lastSequence = Item::query()
            ->where('code', 'like', $prefix.'%')
            ->lockForUpdate()
            ->pluck('code')
            ->map(fn (string $code) => preg_match('/^'.preg_quote($prefix, '/').'(\d+)$/', $code, $matches)
                ? (int) $matches[1]
                : 0)
            ->max() ?? 0;

        return $prefix.str_pad((string) ($lastSequence + 1), 3, '0', STR_PAD_LEFT);
    }

    private function syncItemBaseUom(Item $item): void
    {
        $baseUom = Uom::where('code', $item->base_uom)->where('is_active', true)->firstOrFail();
        ItemUom::where('item_id', $item->id)->update(['is_base' => false]);
        ItemUom::updateOrCreate(
            ['item_id' => $item->id, 'uom_id' => $baseUom->id],
            ['conversion_factor' => 1, 'is_base' => true],
        );
    }
}
