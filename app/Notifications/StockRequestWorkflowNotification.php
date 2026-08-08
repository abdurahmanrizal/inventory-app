<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class StockRequestWorkflowNotification extends Notification
{
    use Queueable;

    public function __construct(
        public readonly string $event,
        public readonly int $workflowApprovalId,
        public readonly int $transactionId,
        public readonly string $transactionNo,
        public readonly string $title,
        public readonly string $message,
        public readonly string $actionUrl,
        public readonly ?string $stageKey = null,
        public readonly ?string $stageLabel = null,
        public readonly ?string $actorName = null,
        public readonly ?int $mainWarehouseId = null,
        public readonly ?string $mainWarehouseName = null,
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
            'event' => $this->event,
            'module' => 'stock_request',
            'workflow_approval_id' => $this->workflowApprovalId,
            'transaction_id' => $this->transactionId,
            'transaction_no' => $this->transactionNo,
            'title' => $this->title,
            'message' => $this->message,
            'action_url' => $this->actionUrl,
            'stage_key' => $this->stageKey,
            'stage_label' => $this->stageLabel,
            'actor_name' => $this->actorName,
            'main_warehouse_id' => $this->mainWarehouseId,
            'main_warehouse_name' => $this->mainWarehouseName,
        ];
    }

    public function databaseType(object $notifiable): string
    {
        return 'stock-request.'.$this->event;
    }
}
