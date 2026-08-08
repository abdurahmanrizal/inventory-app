<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StockTransactionApprovalNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly int $transactionId,
        public readonly string $transactionNo,
        public readonly int $mainWarehouseId,
        public readonly string $mainWarehouseName,
    ) {}

    /** @return array<int, string> */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /** @return array<string, mixed> */
    public function toDatabase(object $notifiable): array
    {
        return [
            'event' => 'approval_required',
            'module' => 'stock_transaction',
            'transaction_id' => $this->transactionId,
            'transaction_no' => $this->transactionNo,
            'title' => 'Stock In menunggu persetujuan',
            'message' => $this->transactionNo.' memerlukan persetujuan untuk masuk ke '.$this->mainWarehouseName.'.',
            'action_url' => '/approvals',
            'stage_key' => 'warehouse_manager',
            'stage_label' => 'Approval manajer gudang utama',
            'main_warehouse_id' => $this->mainWarehouseId,
            'main_warehouse_name' => $this->mainWarehouseName,
        ];
    }

    public function databaseType(object $notifiable): string
    {
        return 'stock-transaction.approval_required';
    }
}
