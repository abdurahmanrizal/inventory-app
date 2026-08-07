<?php

namespace App\Http\Controllers\Settings;

use App\Enums\InventoryValuationMethod;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\InventorySetting;
use App\Models\StockLedger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class InventoryValuationController extends Controller
{
    public function edit(Request $request): Response
    {
        abort_unless($request->user()?->role === UserRole::Superadmin, 403);
        $setting = InventorySetting::current();

        return Inertia::render('settings/inventory-valuation', [
            'setting' => [
                'valuation_method' => $setting->valuation_method->value,
                'locked' => (bool) $setting->locked_at || StockLedger::query()->exists(),
                'locked_at' => $setting->locked_at?->toIso8601String(),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        abort_unless($request->user()?->role === UserRole::Superadmin, 403);
        $data = $request->validate([
            'valuation_method' => ['required', Rule::enum(InventoryValuationMethod::class)],
        ]);
        $setting = InventorySetting::current();
        if ($setting->locked_at || StockLedger::query()->exists()) {
            throw ValidationException::withMessages([
                'valuation_method' => 'Metode valuasi sudah terkunci karena transaksi persediaan telah diposting.',
            ]);
        }
        $setting->update(['valuation_method' => $data['valuation_method']]);

        return back()->with('success', 'Metode valuasi persediaan berhasil disimpan.');
    }
}
