<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\StockRequest;
use App\Models\User;
use App\Models\Warehouse;
use App\Notifications\StockRequestWorkflowNotification;
use App\Services\InventoryWorkflowService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockRequestNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_stock_request_notifies_active_approver_and_creator_when_rejected(): void
    {
        $main = Warehouse::create(['code' => 'NOTIF-MAIN', 'name' => 'Gudang Notifikasi', 'type' => 'main']);
        $unit = Warehouse::create(['code' => 'NOTIF-UNIT', 'name' => 'Unit Notifikasi', 'type' => 'unit', 'main_warehouse_id' => $main->id]);
        $creator = User::factory()->create(['role' => UserRole::UnitUser, 'warehouse_id' => $unit->id]);
        $approver = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $unit->id]);
        $request = StockRequest::create([
            'number' => 'REQ-NOTIFICATION-001',
            'type' => 'to_unit',
            'from_warehouse_id' => $main->id,
            'to_warehouse_id' => $unit->id,
            'request_date' => now(),
            'requested_by' => $creator->id,
        ]);

        $workflow = app(InventoryWorkflowService::class);
        $approval = $workflow->requestApproval('stock_request', $request, $creator, [[
            'stage_key' => 'unit_manager',
            'stage_label' => 'Approval manajer unit',
            'approver_id' => $approver->id,
        ]]);

        $this->assertDatabaseHas('notifications', [
            'type' => 'stock-request.approval_required',
            'notifiable_id' => $approver->id,
        ]);

        $workflow->act($approval, $approver, 'rejected', 'Jumlah belum sesuai kebutuhan.');

        $this->assertDatabaseHas('notifications', [
            'type' => 'stock-request.request_rejected',
            'notifiable_id' => $creator->id,
        ]);
        $notification = $creator->notifications()->firstOrFail();
        $this->assertSame('REQ-NOTIFICATION-001', $notification->data['transaction_no']);
        $this->assertSame('/stock-requests?search=REQ-NOTIFICATION-001', $notification->data['action_url']);

        $this->actingAs($creator)
            ->getJson(route('notifications.index'))
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('items.0.id', $notification->id);

        $this->actingAs($creator)
            ->patch(route('notifications.read', $notification->id))
            ->assertRedirect();
        $this->assertNotNull($notification->fresh()->read_at);
    }

    public function test_user_cannot_mark_another_users_notification_as_read(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $owner->notify(new StockRequestWorkflowNotification(
            event: 'approval_required',
            workflowApprovalId: 1,
            transactionId: 1,
            transactionNo: 'REQ-OWNER',
            title: 'Perlu persetujuan',
            message: 'Request menunggu persetujuan.',
            actionUrl: '/approvals',
        ));
        $notification = $owner->notifications()->firstOrFail();

        $this->actingAs($other)
            ->patch(route('notifications.read', $notification->id))
            ->assertNotFound();
        $this->assertNull($notification->fresh()->read_at);
    }
}
