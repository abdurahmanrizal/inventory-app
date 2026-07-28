<?php

namespace App\Http\Controllers;

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\Approval;
use App\Models\CurrentStock;
use App\Models\StockAdjustment;
use App\Models\StockRequest;
use App\Models\StockTransaction;
use App\Models\Warehouse;
use App\Models\WorkflowApproval;
use App\Services\StockService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ApprovalController extends Controller
{
    public function index(Request $request)
    {
        $query = StockTransaction::with(['details.item:id,code,name', 'sourceWarehouse:id,name', 'destinationWarehouse:id,name', 'creator:id,name', 'approvals' => fn ($query) => $query->with('approver:id,name')->orderBy('level')])
            ->where('status', TransactionStatus::WaitingApproval);

        $isSuperadmin = $request->user()->role === UserRole::Superadmin;
        if (! $isSuperadmin) {
            abort_unless(
                $request->user()->role === UserRole::UnitManager
                || $request->user()->role?->isWarehouseAdmin(),
                403,
            );
            $query->where('assigned_approver_id', $request->user()->id);
        } elseif ($request->filled('warehouse_id')) {
            $warehouseId = $request->integer('warehouse_id');
            abort_unless(Warehouse::whereKey($warehouseId)->exists(), 404);
            $query->where(fn ($builder) => $builder->where('source_warehouse_id', $warehouseId)->orWhere('destination_warehouse_id', $warehouseId));
        }

        $workflowQuery = WorkflowApproval::query()
            ->with(['steps' => fn ($query) => $query->with(['approver:id,name', 'actor:id,name'])->orderBy('level'), 'creator:id,name'])
            ->whereIn('module', ['stock_request', 'stock_adjustment'])
            ->where('status', 'pending');

        if (! $isSuperadmin) {
            $workflowQuery->whereHas('steps', fn ($query) => $query
                ->whereColumn('level', 'workflow_approvals.current_level')
                ->where('approver_id', $request->user()->id)
                ->where('status', 'pending'));
        } elseif ($request->filled('warehouse_id')) {
            $warehouseId = $request->integer('warehouse_id');
            $workflowQuery->where(function ($query) use ($warehouseId) {
                $query
                    ->where(fn ($query) => $query
                        ->where('module', 'stock_request')
                        ->whereIn('transaction_id', StockRequest::query()
                            ->where(fn ($query) => $query->where('from_warehouse_id', $warehouseId)->orWhere('to_warehouse_id', $warehouseId))
                            ->select('id')))
                    ->orWhere(fn ($query) => $query
                        ->where('module', 'stock_adjustment')
                        ->whereIn('transaction_id', StockAdjustment::query()
                            ->where('warehouse_id', $warehouseId)
                            ->select('id')));
            });
        }

        $workflowApprovals = $workflowQuery->latest()->limit(30)->get();
        $stockRequests = StockRequest::with([
            'details.item:id,code,name,base_uom',
            'details.uom:id,code,name',
            'fromWarehouse:id,name',
            'toWarehouse:id,name',
            'requester:id,name',
        ])->whereIn('id', $workflowApprovals->pluck('transaction_id'))->get()->keyBy('id');
        $workflowApprovals->each(fn (WorkflowApproval $approval) => $approval->setAttribute(
            'stock_request',
            $stockRequests->get($approval->transaction_id),
        ));
        $inventoryDocuments = StockAdjustment::with([
            'details.item:id,code,name,base_uom',
            'warehouse:id,name',
            'creator:id,name',
            'opname.details.item:id,code,name,base_uom',
        ])->whereIn('id', $workflowApprovals->where('module', 'stock_adjustment')->pluck('transaction_id'))
            ->get()->keyBy('id');
        $workflowApprovals->each(fn (WorkflowApproval $approval) => $approval->setAttribute(
            'inventory_document',
            $approval->module === 'stock_adjustment'
                ? $inventoryDocuments->get($approval->transaction_id)
                : null,
        ));

        $workflowHistory = WorkflowApproval::query()
            ->with(['steps' => fn ($query) => $query
                ->where('acted_by', $request->user()->id)
                ->orderByDesc('acted_at')])
            ->whereHas('steps', fn ($query) => $query->where('acted_by', $request->user()->id))
            ->latest('updated_at')
            ->limit(50)
            ->get();
        $historyRequests = StockRequest::with([
            'fromWarehouse:id,name',
            'toWarehouse:id,name',
            'deliveries:id,stock_request_id,download_count',
        ])
            ->whereIn('id', $workflowHistory->where('module', 'stock_request')->pluck('transaction_id'))
            ->get()->keyBy('id');
        $historyAdjustments = StockAdjustment::with('warehouse:id,name')
            ->whereIn('id', $workflowHistory->where('module', 'stock_adjustment')->pluck('transaction_id'))
            ->get()->keyBy('id');
        $approvalHistory = $workflowHistory->flatMap(function (WorkflowApproval $approval) use ($historyRequests, $historyAdjustments, $request) {
            $stockRequest = $historyRequests->get($approval->transaction_id);
            $adjustment = $historyAdjustments->get($approval->transaction_id);
            $finalStep = $approval->steps->sortByDesc('level')->first();

            return $approval->steps->map(fn ($step) => [
                'key' => 'workflow-'.$step->id,
                'category' => $approval->module === 'stock_request'
                    ? 'stock_request'
                    : 'adjustment_opname',
                'transaction_no' => $approval->transaction_no,
                'stage_label' => $step->stage_label ?? 'Approval tahap '.$step->level,
                'status' => $step->status,
                'remarks' => $step->remarks,
                'acted_at' => $step->acted_at,
                'source_name' => $stockRequest?->fromWarehouse?->name ?? $adjustment?->warehouse?->name,
                'destination_name' => $stockRequest?->toWarehouse?->name,
                'stock_request_id' => $stockRequest?->id,
                'delivery_note_download_count' => $stockRequest?->deliveries
                    ?->sortByDesc('id')
                    ->first()
                    ?->download_count ?? 0,
                'can_download_delivery_note' => $stockRequest
                    && $approval->status === 'approved'
                    && $finalStep?->stage_key === 'warehouse_manager'
                    && $finalStep?->acted_by === $request->user()->id
                    && $request->user()->role === UserRole::UnitManager
                    && $request->user()->warehouse?->type === 'main',
            ]);
        });
        $legacyHistory = Approval::with(['transaction.sourceWarehouse:id,name', 'transaction.destinationWarehouse:id,name'])
            ->where('approver_id', $request->user()->id)
            ->whereNotNull('acted_at')
            ->latest('acted_at')
            ->limit(50)
            ->get()
            ->map(fn (Approval $approval) => [
                'key' => 'transaction-'.$approval->id,
                'category' => $approval->transaction?->type === TransactionType::StockIn
                    ? 'stock_in'
                    : 'stock_out',
                'transaction_no' => $approval->transaction?->number,
                'stage_label' => 'Approval transaksi stok',
                'status' => $approval->status,
                'remarks' => $approval->remarks,
                'acted_at' => $approval->acted_at,
                'source_name' => $approval->transaction?->sourceWarehouse?->name,
                'destination_name' => $approval->transaction?->destinationWarehouse?->name,
            ]);

        $transactions = $query->latest()->paginate(15)->withQueryString();
        $stockOutTransactions = $transactions->getCollection()
            ->where('type', TransactionType::StockOut);
        $currentStocks = CurrentStock::query()
            ->whereIn('warehouse_id', $stockOutTransactions->pluck('source_warehouse_id')->filter()->unique())
            ->whereIn('item_id', $stockOutTransactions->flatMap->details->pluck('item_id')->unique())
            ->orderBy('id')
            ->get()
            ->groupBy(fn (CurrentStock $stock) => implode('|', [
                $stock->warehouse_id,
                $stock->item_id,
                $stock->batch_no ?? '',
            ]));

        $stockOutTransactions->each(function (StockTransaction $transaction) use ($currentStocks) {
            $transaction->details->each(function ($detail) use ($transaction, $currentStocks) {
                $key = implode('|', [
                    $transaction->source_warehouse_id,
                    $detail->item_id,
                    $detail->batch_no ?? '',
                ]);
                $detail->setAttribute(
                    'current_hpp',
                    $currentStocks->get($key)?->first()?->average_cost,
                );
            });
        });

        return Inertia::render('Approvals/Index', [
            'transactions' => $transactions,
            'workflowApprovals' => $workflowApprovals,
            'approvalHistory' => $approvalHistory->concat($legacyHistory)->sortByDesc('acted_at')->take(50)->values(),
            'warehouses' => $isSuperadmin ? Warehouse::where('is_active', true)->orderBy('name')->get(['id', 'code', 'name', 'type']) : [],
            'canFilterWarehouse' => $isSuperadmin,
            'selectedWarehouse' => $isSuperadmin ? ($request->integer('warehouse_id') ?: null) : $request->user()->warehouse_id,
        ]);
    }

    public function approve(Request $request, StockTransaction $transaction, StockService $service)
    {
        $this->authorizeApprover($request, $transaction);
        $transaction = $service->approveAndPost($transaction, $request->user()->id, $request->input('remarks'));
        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $transaction->status === TransactionStatus::Completed
                ? 'Transaksi disetujui dan stok berhasil diposting.'
                : 'Persetujuan tahap ini berhasil, menunggu approval berikutnya.',
        ]);

        return back();
    }

    public function reject(Request $request, StockTransaction $transaction, StockService $service)
    {
        $this->authorizeApprover($request, $transaction);
        $data = $request->validate(['remarks' => 'required|string|min:5']);
        $service->reject($transaction, $request->user()->id, $data['remarks']);
        Inertia::flash('toast', ['type' => 'success', 'message' => 'Transaksi berhasil ditolak.']);

        return back();
    }

    private function authorizeApprover(Request $request, StockTransaction $transaction): void
    {
        $allowed = $request->user()->role === UserRole::Superadmin
            || ($transaction->type === TransactionType::StockIn
                ? $request->user()->role === UserRole::UnitManager
                    && $transaction->assigned_approver_id === $request->user()->id
                : ($request->user()->role === UserRole::UnitManager || $request->user()->role?->isWarehouseAdmin())
                && $transaction->assigned_approver_id === $request->user()->id);
        abort_unless($allowed, 403);
    }
}
