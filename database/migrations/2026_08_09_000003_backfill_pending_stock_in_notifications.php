<?php

use App\Enums\TransactionStatus;
use App\Enums\TransactionType;
use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    public function up(): void
    {
        $globalManagerIds = DB::table('users')
            ->where('role', UserRole::WarehouseManager->value)
            ->pluck('id');

        $transactions = DB::table('stock_transactions')
            ->join('warehouses', 'warehouses.id', '=', 'stock_transactions.destination_warehouse_id')
            ->where('stock_transactions.type', TransactionType::StockIn->value)
            ->where('stock_transactions.status', TransactionStatus::WaitingApproval->value)
            ->select([
                'stock_transactions.id',
                'stock_transactions.number',
                'stock_transactions.assigned_approver_id',
                'warehouses.id as warehouse_id',
                'warehouses.name as warehouse_name',
            ])
            ->get();

        $existing = DB::table('notifications')
            ->where('type', 'stock-transaction.approval_required')
            ->get(['notifiable_id', 'data'])
            ->mapWithKeys(function ($notification) {
                $data = json_decode($notification->data, true);

                return [($notification->notifiable_id).'|'.($data['transaction_id'] ?? '') => true];
            });

        foreach ($transactions as $transaction) {
            $recipientIds = $globalManagerIds
                ->concat([$transaction->assigned_approver_id])
                ->filter()
                ->unique();

            foreach ($recipientIds as $recipientId) {
                if ($existing->has($recipientId.'|'.$transaction->id)) {
                    continue;
                }

                DB::table('notifications')->insert([
                    'id' => (string) Str::uuid(),
                    'type' => 'stock-transaction.approval_required',
                    'notifiable_type' => User::class,
                    'notifiable_id' => $recipientId,
                    'data' => json_encode([
                        'event' => 'approval_required',
                        'module' => 'stock_transaction',
                        'transaction_id' => $transaction->id,
                        'transaction_no' => $transaction->number,
                        'title' => 'Stock In menunggu persetujuan',
                        'message' => $transaction->number.' memerlukan persetujuan untuk masuk ke '.$transaction->warehouse_name.'.',
                        'action_url' => '/approvals',
                        'stage_key' => 'warehouse_manager',
                        'stage_label' => 'Approval manajer gudang utama',
                        'main_warehouse_id' => $transaction->warehouse_id,
                        'main_warehouse_name' => $transaction->warehouse_name,
                    ], JSON_THROW_ON_ERROR),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        DB::table('notifications')
            ->where('type', 'stock-transaction.approval_required')
            ->delete();
    }
};
