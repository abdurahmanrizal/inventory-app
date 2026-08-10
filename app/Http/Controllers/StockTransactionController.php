<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\InventorySetting;
use App\Models\Item;
use App\Models\StockCostLayer;
use App\Models\StockLedger;
use App\Models\StockTransaction;
use App\Models\User;
use App\Models\Warehouse;
use App\Notifications\StockTransactionApprovalNotification;
use App\Services\InventoryValuationService;
use App\Support\ApproverResolver;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class StockTransactionController extends Controller
{
    public function index(Request $request)
    {
        $type = $request->string('type')->toString() ?: TransactionType::StockIn->value;
        $user = $request->user()->load('warehouse.mainWarehouse');
        $role = $user->role ?? UserRole::Superadmin;
        $isSuperadmin = $role === UserRole::Superadmin;
        $isWarehouseAdmin = $role->isWarehouseAdmin() && $user->warehouse_id;
        $isUnitAdmin = $role === UserRole::UnitUser && $user->warehouse?->type === 'unit';
        $canStockIn = $isSuperadmin || $isWarehouseAdmin;
        $canStockOut = $isSuperadmin || $isWarehouseAdmin || $isUnitAdmin;
        abort_unless($user->hasPermission($type === TransactionType::StockIn->value ? 'stock.in' : 'stock.out'), 403);
        abort_unless($type === TransactionType::StockIn->value ? $canStockIn : $canStockOut, 403);
        $transactions = StockTransaction::with([
            'sourceWarehouse:id,name',
            'destinationWarehouse:id,name',
            'creator:id,name',
            'approvals' => fn ($query) => $query->with('approver:id,name')->orderBy('level'),
        ])->latest();
        if ($type === TransactionType::StockIn->value) {
            $transactions->where('type', TransactionType::StockIn)
                ->when(! $isSuperadmin, fn ($query) => $query->where('destination_warehouse_id', $user->warehouse_id));
        } else {
            $transactions->where(fn ($query) => $query
                ->where('type', TransactionType::StockOut)
                ->orWhere(fn ($query) => $query
                    ->where('type', TransactionType::Transfer)
                    ->where('request_kind', 'unit_return')))
                ->when(! $isSuperadmin, fn ($query) => $query->where('source_warehouse_id', $user->warehouse_id));
        }

        $warehouses = Warehouse::where('is_active', true);
        if (! $isSuperadmin && $type === TransactionType::StockIn->value) {
            $warehouses->whereKey($user->warehouse_id);
        }

        if ($type === TransactionType::StockIn->value) {
            $itemWarehouseType = $isWarehouseAdmin
                ? ($user->warehouse?->inventory_type ?? match ($role) {
                    UserRole::WarehouseAdminDry => 'dry',
                    UserRole::WarehouseAdminWet => 'wet',
                    default => null,
                })
                : null;
            $availableItems = Item::query()
                ->where('is_active', true)
                ->when($itemWarehouseType, fn ($query) => $query->whereIn('warehouse_type', [$itemWarehouseType, 'both']))
                ->orderBy('name')
                ->get(['id', 'code', 'name', 'base_uom', 'warehouse_type'])
                ->map(fn (Item $item) => [
                    ...$item->only(['id', 'code', 'name', 'base_uom', 'warehouse_type']),
                    'warehouse_ids' => [],
                    'available_qty' => 0,
                ]);
        } else {
            $stockWarehouseIds = $user->warehouse_id
                ? collect([$user->warehouse_id])
                : (clone $warehouses)->pluck('id');
            $availableItems = CurrentStock::query()
                ->with('item:id,code,name,base_uom,warehouse_type')
                ->whereHas('item', fn ($query) => $query->where('is_active', true))
                ->whereIn('warehouse_id', $stockWarehouseIds)
                ->whereColumn('qty_on_hand', '>', 'qty_reserved')
                ->get()
                ->groupBy('item_id')
                ->map(function ($stocks) {
                    $item = $stocks->first()->item;

                    return [
                        'id' => $item->id,
                        'code' => $item->code,
                        'name' => $item->name,
                        'base_uom' => $item->base_uom,
                        'warehouse_type' => $item->warehouse_type,
                        'warehouse_ids' => $stocks->pluck('warehouse_id')->unique()->values(),
                        'available_qty' => $stocks->sum(fn (CurrentStock $stock) => $stock->qty_available),
                    ];
                })->values();
        }

        return Inertia::render($type === 'stock_in' ? 'StockIn/Index' : 'StockOut/Index', [
            'transactions' => $transactions->paginate(15)->withQueryString(),
            'warehouses' => $warehouses->get(['id', 'name', 'type', 'main_warehouse_id']),
            'items' => $availableItems,
            'stockInMode' => 'supplier_receipt',
            'userWarehouse' => $user->warehouse,
            'access' => ['isSuperadmin' => $isSuperadmin, 'isUnitAdmin' => $isUnitAdmin],
        ]);
    }

    public function store(Request $request)
    {
        abort_unless(
            $request->user()->hasPermission('stock.in') || $request->user()->hasPermission('stock.out'),
            403,
        );
        $unitCostRules = $request->input('type') === TransactionType::StockIn->value
            ? ['required', 'numeric', 'gt:0']
            : ['nullable', 'numeric', 'gte:0'];
        $data = $request->validate([
            'type' => ['required', Rule::enum(TransactionType::class)],
            'request_kind' => ['nullable', Rule::in(['supplier_receipt', 'unit_request', 'unit_return'])],
            'stock_out_reason' => ['nullable', Rule::in(['operational', 'waste', 'return', 'restitution'])],
            'source_warehouse_id' => ['nullable', 'exists:warehouses,id'],
            'destination_warehouse_id' => ['nullable', 'exists:warehouses,id'],
            'supplier_name' => ['nullable', 'string', 'max:150'],
            'receipt_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:max_width=8000,max_height=8000'],
            'payment_proof_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:max_width=8000,max_height=8000'],
            'delivery_proof_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:max_width=8000,max_height=8000'],
            'document_date' => ['required', 'date'], 'notes' => ['nullable', 'string'],
            'details' => ['required', 'array', 'min:1'], 'details.*.item_id' => ['required', 'exists:items,id'],
            'details.*.qty' => ['required', 'numeric', 'gt:0'], 'details.*.unit_cost' => $unitCostRules,
            'details.*.batch_no' => ['nullable', 'string', 'max:100'], 'details.*.expired_at' => ['nullable', 'date'],
        ]);

        $user = $request->user()->load('warehouse.mainWarehouse');
        $role = $user->role ?? UserRole::Superadmin;
        $isSuperadmin = $role === UserRole::Superadmin;
        $isWarehouseAdmin = $role->isWarehouseAdmin() && $user->warehouse_id;
        $isUnitAdmin = $role === UserRole::UnitUser && $user->warehouse?->type === 'unit';
        $requestKind = $data['request_kind'] ?? null;
        abort_if($requestKind === 'unit_request', 403);
        $type = TransactionType::from($data['type']);
        abort_unless($user->hasPermission($type === TransactionType::StockIn ? 'stock.in' : 'stock.out'), 403);

        if ($type === TransactionType::StockIn) {
            abort_unless($isSuperadmin || $isWarehouseAdmin, 403);
            $data['request_kind'] = 'supplier_receipt';
            if ($isWarehouseAdmin) {
                $data['destination_warehouse_id'] = $user->warehouse_id;
            }
            abort_unless($data['destination_warehouse_id'] ?? null, 422, 'Gudang tujuan wajib dipilih.');
            $allowedItemWarehouseType = $isWarehouseAdmin
                ? ($user->warehouse?->inventory_type ?? match ($role) {
                    UserRole::WarehouseAdminDry => 'dry',
                    UserRole::WarehouseAdminWet => 'wet',
                    default => null,
                })
                : null;
            if ($allowedItemWarehouseType) {
                $invalidItemExists = Item::query()
                    ->whereIn('id', collect($data['details'])->pluck('item_id'))
                    ->where(fn ($query) => $query
                        ->where('is_active', false)
                        ->orWhereNotIn('warehouse_type', [$allowedItemWarehouseType, 'both']))
                    ->exists();
                abort_if($invalidItemExists, 422, 'Item tidak sesuai dengan jenis gudang tujuan.');
            }
            $approvalWarehouseId = $data['destination_warehouse_id'];
        } else {
            abort_unless($isSuperadmin || $isWarehouseAdmin || $isUnitAdmin, 403);
            if ($isUnitAdmin) {
                abort_unless($type === TransactionType::StockOut, 403, 'Admin unit hanya dapat membuat Stock Out.');
                abort_unless($data['stock_out_reason'] ?? null, 422, 'Jenis pengeluaran stok wajib dipilih.');
            }
            if (! $isSuperadmin) {
                $data['source_warehouse_id'] = $user->warehouse_id;
            }
            abort_unless($data['source_warehouse_id'] ?? null, 422, 'Gudang asal wajib dipilih.');
            $data['request_kind'] = null;
            $approvalWarehouseId = $data['source_warehouse_id'];
        }

        $isUnitReturn = $type === TransactionType::StockOut
            && ($data['stock_out_reason'] ?? null) === 'restitution';
        if ($isUnitReturn) {
            abort_unless($isUnitAdmin, 422, 'Pengembalian ke gudang utama hanya dapat diajukan dari gudang unit.');
            $destinationWarehouseId = $this->unitReturnDestination($user->warehouse, $data['details']);
            $data['type'] = TransactionType::Transfer->value;
            $data['request_kind'] = 'unit_return';
            $data['source_warehouse_id'] = $user->warehouse_id;
            $data['destination_warehouse_id'] = $destinationWarehouseId;
            $type = TransactionType::Transfer;
        }

        $approvalWarehouseIds = $isUnitReturn
            ? [$user->warehouse_id, $data['destination_warehouse_id']]
            : [$approvalWarehouseId];
        $approvers = ApproverResolver::forWarehouses($approvalWarehouseIds);
        $missingWarehouseIds = array_diff(array_unique($approvalWarehouseIds), array_keys($approvers));
        abort_unless($missingWarehouseIds === [], 422, 'Manajer untuk gudang terkait belum ditentukan.');
        $approverIds = array_values(array_map(fn (int $id) => $approvers[$id]->id, array_unique($approvalWarehouseIds)));
        $assignedApproverId = $approverIds[0];

        if ($requestKind === 'supplier_receipt') {
            $data['type'] = TransactionType::StockIn->value;
        }

        $type = TransactionType::from($data['type']);
        if ($type === TransactionType::StockIn && empty($data['destination_warehouse_id'])) {
            abort(422, 'Gudang tujuan wajib dipilih.');
        }
        if (in_array($type, [TransactionType::StockOut, TransactionType::Transfer], true) && empty($data['source_warehouse_id'])) {
            abort(422, 'Gudang asal wajib dipilih.');
        }
        if ($type === TransactionType::Transfer && empty($data['destination_warehouse_id'])) {
            abort(422, 'Gudang tujuan wajib dipilih untuk mutasi.');
        }
        if ($type === TransactionType::Transfer && (string) $data['source_warehouse_id'] === (string) $data['destination_warehouse_id']) {
            abort(422, 'Gudang asal dan tujuan mutasi harus berbeda.');
        }
        $storedImages = [];
        if ($type === TransactionType::StockIn) {
            foreach (['receipt_image' => 'receipt_image_path', 'payment_proof_image' => 'payment_proof_image_path', 'delivery_proof_image' => 'delivery_proof_image_path'] as $input => $column) {
                if ($request->hasFile($input)) {
                    $data[$column] = $this->storeCompressedImage($request->file($input), $input);
                    $storedImages[] = $data[$column];
                }
            }
        }
        unset($data['receipt_image'], $data['payment_proof_image'], $data['delivery_proof_image']);

        try {
            $tx = DB::transaction(function () use ($data, $type, $request, $assignedApproverId, $approverIds) {
                $tx = StockTransaction::create([...$data, 'number' => $this->number($type), 'status' => TransactionStatus::WaitingApproval, 'created_by' => $request->user()->id, 'assigned_approver_id' => $assignedApproverId]);
                $tx->details()->createMany($data['details']);
                foreach ($approverIds as $index => $approverId) {
                    $tx->approvals()->create([
                        'level' => $index + 1,
                        'approver_id' => $approverId,
                        'status' => 'pending',
                    ]);
                }

                return $tx;
            });
        } catch (\Throwable $exception) {
            Storage::disk('local')->delete($storedImages);
            throw $exception;
        }

        if ($type === TransactionType::StockIn) {
            $mainWarehouse = Warehouse::findOrFail($tx->destination_warehouse_id);
            $recipientIds = User::query()
                ->where('role', UserRole::WarehouseManager)
                ->pluck('id')
                ->push($assignedApproverId)
                ->unique();
            $recipientIds->each(fn (int $recipientId) => User::find($recipientId)?->notify(
                new StockTransactionApprovalNotification(
                    transactionId: $tx->id,
                    transactionNo: $tx->number,
                    mainWarehouseId: $mainWarehouse->id,
                    mainWarehouseName: $mainWarehouse->name,
                ),
            ));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => "Transaksi {$tx->number} berhasil diajukan ke manajer."]);

        return back();
    }

    private function unitReturnDestination(Warehouse $unitWarehouse, array $details): int
    {
        abort_unless($unitWarehouse->type === 'unit', 422, 'Gudang sumber pengembalian harus berupa gudang unit.');
        $fallbackId = $unitWarehouse->main_warehouse_id;
        abort_unless($fallbackId, 422, 'Gudang utama untuk unit belum ditentukan.');

        if (InventorySetting::current()->valuation_method->value !== 'fifo') {
            return (int) $fallbackId;
        }

        $destinationIds = collect($details)->flatMap(function (array $detail) use ($unitWarehouse, $fallbackId) {
            $layers = StockCostLayer::query()
                ->where('warehouse_id', $unitWarehouse->id)
                ->where('item_id', $detail['item_id'])
                ->when($detail['batch_no'] ?? null, fn ($query, $batch) => $query->where('batch_no', $batch))
                ->where('remaining_qty', '>', 0)
                ->orderBy('received_at')->orderBy('id')->get();
            $remaining = (float) $detail['qty'];
            $origins = collect();
            foreach ($layers as $layer) {
                if ($remaining <= 0) {
                    break;
                }
                $take = min($remaining, (float) $layer->remaining_qty);
                $root = $layer;
                while ($root->source_cost_layer_id) {
                    $source = StockCostLayer::find($root->source_cost_layer_id);
                    if (! $source) {
                        break;
                    }
                    $root = $source;
                }
                $origin = Warehouse::find($root->warehouse_id);
                $origins->push($origin?->type === 'main' ? $origin->id : $fallbackId);
                $remaining -= $take;
            }
            abort_if($remaining > 0.000001, 422, 'Stok FIFO untuk pengembalian tidak mencukupi.');

            return $origins;
        })->unique()->values();

        abort_if($destinationIds->count() > 1, 422, 'Item pengembalian berasal dari beberapa gudang utama. Pisahkan menjadi transaksi berbeda.');

        return (int) ($destinationIds->first() ?? $fallbackId);
    }

    public function document(StockTransaction $transaction, InventoryValuationService $valuation)
    {
        $transaction->load([
            'details.item:id,code,name,base_uom',
            'sourceWarehouse:id,code,name',
            'destinationWarehouse:id,code,name',
            'creator:id,name',
            'approver:id,name',
            'approvals' => fn ($query) => $query->with('approver:id,name')->orderBy('level'),
        ]);
        $isInventoryIssue = $transaction->type === TransactionType::StockOut
            || ($transaction->type === TransactionType::Transfer && $transaction->request_kind === 'unit_return');
        if ($isInventoryIssue) {
            $postedCosts = StockLedger::query()
                ->where('stock_transaction_id', $transaction->id)
                ->where('direction', 'out')
                ->orderBy('id')
                ->get()
                ->groupBy(fn (StockLedger $ledger) => implode('|', [
                    $ledger->item_id,
                    $ledger->batch_no ?? '',
                ]));

            $transaction->details->each(function ($detail) use ($postedCosts, $transaction, $valuation) {
                $key = implode('|', [$detail->item_id, $detail->batch_no ?? '']);
                $posted = $postedCosts->get($key, collect());
                $postedQty = $posted->sum(fn (StockLedger $ledger) => (float) $ledger->qty);
                $postedUnitCost = $postedQty > 0
                    ? $posted->sum(fn (StockLedger $ledger) => (float) $ledger->qty * (float) $ledger->unit_cost) / $postedQty
                    : null;
                $detail->setAttribute(
                    'document_hpp',
                    $postedUnitCost ?? $valuation->estimatedIssueUnitCost(
                        $transaction->source_warehouse_id,
                        $detail->item_id,
                        (float) $detail->qty,
                        $detail->batch_no,
                    ),
                );
            });
        }
        $options = new Options;
        $options->set('defaultFont', 'DejaVu Sans');
        $options->set('isRemoteEnabled', false);
        $pdf = new Dompdf($options);
        $pdf->loadHtml(view('documents.stock-transaction', ['transaction' => $transaction])->render());
        $pdf->setPaper('A4', 'portrait');
        $pdf->render();
        $filename = 'pengajuan-'.strtolower(str_replace('_', '-', $transaction->type->value)).'-'.$transaction->number.'.pdf';

        return response($pdf->output(), 200, ['Content-Type' => 'application/pdf', 'Content-Disposition' => 'attachment; filename="'.$filename.'"']);
    }

    public function evidence(Request $request, StockTransaction $transaction, string $kind)
    {
        abort_unless(in_array($kind, ['receipt', 'payment', 'delivery'], true), 404);
        $user = $request->user();
        $warehouseId = $transaction->type === TransactionType::StockIn
            ? $transaction->destination_warehouse_id
            : $transaction->source_warehouse_id;
        abort_unless(
            $user->role === UserRole::Superadmin
            || $user->warehouse_id === $warehouseId
            || $transaction->created_by === $user->id
            || $transaction->assigned_approver_id === $user->id,
            403,
        );
        $path = match ($kind) {
            'receipt' => $transaction->receipt_image_path,
            'payment' => $transaction->payment_proof_image_path,
            'delivery' => $transaction->delivery_proof_image_path,
        };
        abort_unless($path && Storage::disk('local')->exists($path), 404);

        return Storage::disk('local')->response($path);
    }

    private function number(TransactionType $type): string
    {
        return strtoupper($type->value).'-'.now()->format('YmdHis').'-'.random_int(10, 99);
    }

    private function storeCompressedImage($file, string $kind): string
    {
        $source = imagecreatefromstring(file_get_contents($file->getRealPath()));
        abort_unless($source !== false, 422, 'Gambar tidak dapat diproses.');
        $width = imagesx($source);
        $height = imagesy($source);
        $scale = min(1, 1600 / max($width, $height));
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));
        $target = imagecreatetruecolor($targetWidth, $targetHeight);
        $white = imagecolorallocate($target, 255, 255, 255);
        imagefill($target, 0, 0, $white);
        imagecopyresampled($target, $source, 0, 0, 0, 0, $targetWidth, $targetHeight, $width, $height);
        ob_start();
        imagejpeg($target, null, 75);
        $contents = ob_get_clean();
        imagedestroy($source);
        imagedestroy($target);

        $path = 'stock-transactions/'.now()->format('Y/m').'/'.$kind.'-'.Str::uuid().'.jpg';
        abort_unless(Storage::disk('local')->put($path, $contents), 500, 'Gambar gagal disimpan.');

        return $path;
    }
}
