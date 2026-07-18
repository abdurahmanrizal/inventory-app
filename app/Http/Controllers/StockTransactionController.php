<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\Item;
use App\Models\StockTransaction;
use App\Models\User;
use App\Models\Warehouse;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
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
        $transactions = StockTransaction::with(['sourceWarehouse:id,name', 'destinationWarehouse:id,name', 'creator:id,name'])->latest();
        if ($type === TransactionType::StockIn->value) {
            $transactions->where('type', TransactionType::StockIn)
                ->when(! $isSuperadmin, fn ($query) => $query->where('destination_warehouse_id', $user->warehouse_id));
        } else {
            $transactions->whereIn('type', [TransactionType::StockOut, TransactionType::Transfer])->whereNull('request_kind')
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
            'access' => ['isSuperadmin' => $isSuperadmin, 'isUnitAdmin' => $isUnitAdmin, 'canTransfer' => ! $isUnitAdmin],
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'type' => ['required', Rule::enum(TransactionType::class)],
            'request_kind' => ['nullable', Rule::in(['supplier_receipt', 'unit_request'])],
            'stock_out_reason' => ['nullable', Rule::in(['operational', 'shrinkage', 'expired', 'damaged', 'waste', 'return', 'other'])],
            'source_warehouse_id' => ['nullable', 'exists:warehouses,id'],
            'destination_warehouse_id' => ['nullable', 'exists:warehouses,id'],
            'supplier_name' => ['nullable', 'string', 'max:150'],
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

        $manager = User::where('role', UserRole::UnitManager)->where('warehouse_id', $approvalWarehouseId)->first();
        abort_unless($manager, 422, 'Manajer untuk gudang terkait belum ditentukan.');
        $assignedApproverId = $manager->id;

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
        $tx = DB::transaction(function () use ($data, $type, $request, $assignedApproverId) {
            $tx = StockTransaction::create([...$data, 'number' => $this->number($type), 'status' => TransactionStatus::WaitingApproval, 'created_by' => $request->user()->id, 'assigned_approver_id' => $assignedApproverId]);
            $tx->details()->createMany($data['details']);

            return $tx;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => "Transaksi {$tx->number} berhasil diajukan ke manajer."]);

        return back();
    }

    public function document(StockTransaction $transaction)
    {
        $transaction->load(['details.item:id,code,name,base_uom', 'sourceWarehouse:id,code,name', 'destinationWarehouse:id,code,name', 'creator:id,name', 'approver:id,name']);
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

    private function number(TransactionType $type): string
    {
        return strtoupper($type->value).'-'.now()->format('YmdHis').'-'.random_int(10, 99);
    }
}
