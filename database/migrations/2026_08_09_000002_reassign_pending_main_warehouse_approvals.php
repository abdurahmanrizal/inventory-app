<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $globalManagerIds = DB::table('users')->where('role', 'warehouse_manager')->pluck('id');
        if ($globalManagerIds->isEmpty()) {
            return;
        }

        $scopedManagers = DB::table('users')
            ->where('role', 'unit_manager')
            ->whereNotNull('warehouse_id')
            ->orderBy('name')
            ->get(['id', 'warehouse_id'])
            ->unique('warehouse_id')
            ->keyBy('warehouse_id');

        DB::table('stock_transactions')
            ->where('status', 'waiting_approval')
            ->whereIn('assigned_approver_id', $globalManagerIds)
            ->orderBy('id')
            ->get(['id', 'type', 'source_warehouse_id', 'destination_warehouse_id', 'assigned_approver_id'])
            ->each(function ($transaction) use ($scopedManagers): void {
                $warehouseId = $transaction->type === 'stock_in'
                    ? $transaction->destination_warehouse_id
                    : ($transaction->source_warehouse_id ?: $transaction->destination_warehouse_id);
                $manager = $scopedManagers->get($warehouseId);
                if (! $manager) {
                    return;
                }

                DB::table('stock_transactions')->where('id', $transaction->id)->update([
                    'assigned_approver_id' => $manager->id,
                    'updated_at' => now(),
                ]);
                DB::table('approvals')
                    ->where('stock_transaction_id', $transaction->id)
                    ->where('status', 'pending')
                    ->where('approver_id', $transaction->assigned_approver_id)
                    ->update(['approver_id' => $manager->id, 'updated_at' => now()]);
            });
    }

    public function down(): void
    {
        // Assignment lama tidak dapat dipulihkan secara aman tanpa audit map.
    }
};
