<?php

namespace App\Support;

use App\Models\StockRequest;

final class NotificationPresenter
{
    public static function make($notification): array
    {
        $data = $notification->data;
        if (! isset($data['main_warehouse_id']) && ($data['module'] ?? null) === 'stock_request' && isset($data['transaction_id'])) {
            $request = StockRequest::with('fromWarehouse.mainWarehouse')->find($data['transaction_id']);
            $main = $request?->fromWarehouse?->type === 'main'
                ? $request->fromWarehouse
                : $request?->fromWarehouse?->mainWarehouse;
            if ($main) {
                $data['main_warehouse_id'] = $main->id;
                $data['main_warehouse_name'] = $main->name;
            }
        }

        return [
            'id' => $notification->id,
            'type' => $notification->type,
            'data' => $data,
            'read_at' => $notification->read_at?->toIso8601String(),
            'created_at' => $notification->created_at?->toIso8601String(),
        ];
    }
}
