<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Item;
use App\Models\StockLedger;
use App\Models\StockTransaction;
use App\Models\User;
use App\Models\Warehouse;
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
            $transactions->where('type', TransactionType::StockOut)
                ->when(! $isSuperadmin, fn ($query) => $query->where('source_warehouse_id', $user->warehouse_id));
        }

        $warehouses = Warehouse::where('is_active', true);
        if (! $isSuperadmin && $type === TransactionType::StockIn->value) {
            $warehouses->whereKey($user->warehouse_id);
        }

        $items = Item::where('is_active', true);
        if ($role === UserRole::WarehouseAdminDry) {
            $items->whereIn('warehouse_type', ['dry', 'both']);
        } elseif ($role === UserRole::WarehouseAdminWet) {
            $items->whereIn('warehouse_type', ['wet', 'both']);
        }

        return Inertia::render($type === 'stock_in' ? 'StockIn/Index' : 'StockOut/Index', [
            'transactions' => $transactions->paginate(15)->withQueryString(),
            'warehouses' => $warehouses->get(['id', 'name', 'type', 'main_warehouse_id']),
            'items' => $items->get(['id', 'code', 'name', 'base_uom']),
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
        $data = $request->validate([
            'type' => ['required', Rule::enum(TransactionType::class)],
            'request_kind' => ['nullable', Rule::in(['supplier_receipt', 'unit_request'])],
            'stock_out_reason' => ['nullable', Rule::in(['operational', 'shrinkage', 'expired', 'damaged', 'waste', 'return', 'other'])],
            'source_warehouse_id' => ['nullable', 'exists:warehouses,id'],
            'destination_warehouse_id' => ['nullable', 'exists:warehouses,id'],
            'supplier_name' => ['nullable', 'string', 'max:150'],
            'receipt_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:max_width=8000,max_height=8000'],
            'payment_proof_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:max_width=8000,max_height=8000'],
            'delivery_proof_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:max_width=8000,max_height=8000'],
            'document_date' => ['required', 'date'], 'notes' => ['nullable', 'string'],
            'details' => ['required', 'array', 'min:1'], 'details.*.item_id' => ['required', 'exists:items,id'],
            'details.*.qty' => ['required', 'numeric', 'gt:0'], 'details.*.unit_cost' => ['nullable', 'numeric', 'gte:0'],
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

        $manager = User::query()
            ->where('role', UserRole::UnitManager)
            ->where('warehouse_id', $approvalWarehouseId)
            ->orderBy('name')
            ->first();
        abort_unless($manager, 422, 'Manajer untuk gudang terkait belum ditentukan.');
        $approverIds = [$manager->id];
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

        Inertia::flash('toast', ['type' => 'success', 'message' => "Transaksi {$tx->number} berhasil diajukan ke manajer."]);

        return back();
    }

    public function document(StockTransaction $transaction)
    {
        $transaction->load(['details.item:id,code,name,base_uom', 'sourceWarehouse:id,code,name', 'destinationWarehouse:id,code,name', 'creator:id,name', 'approver:id,name']);
        if ($transaction->type === TransactionType::StockOut) {
            $postedCosts = StockLedger::query()
                ->where('stock_transaction_id', $transaction->id)
                ->where('direction', 'out')
                ->orderBy('id')
                ->get()
                ->keyBy(fn (StockLedger $ledger) => implode('|', [
                    $ledger->item_id,
                    $ledger->batch_no ?? '',
                ]));
            $currentCosts = CurrentStock::query()
                ->where('warehouse_id', $transaction->source_warehouse_id)
                ->whereIn('item_id', $transaction->details->pluck('item_id')->unique())
                ->orderBy('id')
                ->get()
                ->keyBy(fn (CurrentStock $stock) => implode('|', [
                    $stock->item_id,
                    $stock->batch_no ?? '',
                ]));

            $transaction->details->each(function ($detail) use ($postedCosts, $currentCosts) {
                $key = implode('|', [$detail->item_id, $detail->batch_no ?? '']);
                $detail->setAttribute(
                    'document_hpp',
                    $postedCosts->get($key)?->unit_cost
                        ?? $currentCosts->get($key)?->average_cost
                        ?? $detail->unit_cost,
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
