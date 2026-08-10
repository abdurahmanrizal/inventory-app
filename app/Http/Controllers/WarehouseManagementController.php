<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\CurrentStock;
use App\Models\Warehouse;
use Illuminate\Database\QueryException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class WarehouseManagementController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorizeSuperadmin($request);
        $search = trim($request->string('search')->toString());
        $filter = $request->string('filter')->toString();
        abort_if($filter !== '' && ! in_array($filter, ['main', 'unit', 'dry', 'wet', 'inactive'], true), 422);

        $query = Warehouse::query()
            ->with('mainWarehouse:id,code,name,inventory_type')
            ->withCount(['stocks'])
            ->when($search, fn ($query) => $query->where(fn ($query) => $query
                ->where('name', 'like', "%{$search}%")
                ->orWhere('code', 'like', "%{$search}%")))
            ->when($filter === 'main', fn ($query) => $query->where('type', 'main'))
            ->when($filter === 'unit', fn ($query) => $query->where('type', 'unit'))
            ->when(in_array($filter, ['dry', 'wet'], true), fn ($query) => $query->where(fn ($query) => $query
                ->where('inventory_type', $filter)
                ->orWhereHas('mainWarehouse', fn ($query) => $query->where('inventory_type', $filter))))
            ->when($filter === 'inactive', fn ($query) => $query->where('is_active', false));

        return Inertia::render('WarehouseManagement/Index', [
            'warehouses' => $query->orderByRaw("type = 'main' desc")->orderBy('name')->paginate(10)->withQueryString(),
            'mainWarehouses' => Warehouse::where('type', 'main')->orderBy('name')->get(['id', 'code', 'name', 'inventory_type', 'is_active']),
            'filters' => ['search' => $search, 'filter' => $filter],
            'counts' => [
                'all' => Warehouse::count(),
                'main' => Warehouse::where('type', 'main')->count(),
                'unit' => Warehouse::where('type', 'unit')->count(),
                'dry' => Warehouse::where(fn ($query) => $query->where('inventory_type', 'dry')->orWhereHas('mainWarehouse', fn ($query) => $query->where('inventory_type', 'dry')))->count(),
                'wet' => Warehouse::where(fn ($query) => $query->where('inventory_type', 'wet')->orWhereHas('mainWarehouse', fn ($query) => $query->where('inventory_type', 'wet')))->count(),
                'inactive' => Warehouse::where('is_active', false)->count(),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        Warehouse::create($this->validated($request));

        return back()->with('success', 'Gudang berhasil ditambahkan.');
    }

    public function update(Request $request, Warehouse $warehouse): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $data = $this->validated($request, $warehouse);
        if ($warehouse->type === 'main' && $data['type'] === 'unit' && Warehouse::where('main_warehouse_id', $warehouse->id)->exists()) {
            throw ValidationException::withMessages(['type' => 'Gudang utama yang masih memiliki unit tidak dapat diubah menjadi gudang unit.']);
        }
        if (! $data['is_active'] && $warehouse->type === 'main' && Warehouse::where('main_warehouse_id', $warehouse->id)->where('is_active', true)->exists()) {
            throw ValidationException::withMessages(['is_active' => 'Nonaktifkan seluruh gudang unit terkait terlebih dahulu.']);
        }
        if ($warehouse->type === 'main'
            && $warehouse->inventory_type !== $data['inventory_type']
            && CurrentStock::whereIn('warehouse_id', Warehouse::where('main_warehouse_id', $warehouse->id)->pluck('id')->push($warehouse->id))->exists()) {
            throw ValidationException::withMessages(['inventory_type' => 'Kategori gudang utama tidak dapat diubah karena jaringan gudang sudah memiliki stok.']);
        }
        $warehouse->update($data);

        return back()->with('success', 'Gudang berhasil diperbarui.');
    }

    public function destroy(Request $request, Warehouse $warehouse): RedirectResponse
    {
        $this->authorizeSuperadmin($request);
        $hasTransactionHistory = DB::table('stock_transactions')
            ->where('source_warehouse_id', $warehouse->id)
            ->orWhere('destination_warehouse_id', $warehouse->id)
            ->exists()
            || DB::table('stock_requests')->where('from_warehouse_id', $warehouse->id)->orWhere('to_warehouse_id', $warehouse->id)->exists()
            || DB::table('stock_ledgers')->where('warehouse_id', $warehouse->id)->exists()
            || DB::table('stock_adjustments')->where('warehouse_id', $warehouse->id)->exists()
            || DB::table('stock_opnames')->where('warehouse_id', $warehouse->id)->exists();
        if ($hasTransactionHistory
            || Warehouse::where('main_warehouse_id', $warehouse->id)->exists()
            || $warehouse->stocks()->exists()
            || $warehouse->users()->exists()
            || $warehouse->locations()->exists()) {
            throw ValidationException::withMessages(['warehouse' => 'Gudang tidak dapat dihapus karena sudah digunakan atau masih memiliki unit terkait. Nonaktifkan gudang sebagai gantinya.']);
        }
        try {
            $warehouse->delete();
        } catch (QueryException) {
            throw ValidationException::withMessages(['warehouse' => 'Gudang sudah memiliki riwayat transaksi dan tidak dapat dihapus. Nonaktifkan gudang sebagai gantinya.']);
        }

        return back()->with('success', 'Gudang berhasil dihapus.');
    }

    private function validated(Request $request, ?Warehouse $warehouse = null): array
    {
        $data = $request->validate([
            'code' => ['required', 'string', 'max:50', Rule::unique('warehouses', 'code')->ignore($warehouse)],
            'name' => ['required', 'string', 'max:150'],
            'type' => ['required', Rule::in(['main', 'unit'])],
            'inventory_type' => [Rule::requiredIf(fn () => $request->input('type') === 'main'), 'nullable', Rule::in(['dry', 'wet'])],
            'main_warehouse_id' => [Rule::requiredIf(fn () => $request->input('type') === 'unit'), 'nullable', Rule::notIn(array_filter([$warehouse?->id])), Rule::exists('warehouses', 'id')->where('type', 'main')],
            'is_active' => ['required', 'boolean'],
        ]);
        $data['code'] = strtoupper(trim($data['code']));
        if ($data['type'] === 'main') {
            $data['main_warehouse_id'] = null;
        } else {
            $data['inventory_type'] = null;
        }

        return $data;
    }

    private function authorizeSuperadmin(Request $request): void
    {
        abort_unless($request->user()->role === UserRole::Superadmin, 403);
    }
}
