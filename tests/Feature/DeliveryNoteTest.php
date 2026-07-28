<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\Delivery;
use App\Models\Item;
use App\Models\StockRequest;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\WorkflowApproval;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DeliveryNoteTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_final_main_warehouse_manager_can_download_approved_delivery_note(): void
    {
        $main = Warehouse::create(['code' => 'MAIN-DRY', 'name' => 'Gudang Utama Kering', 'type' => 'main']);
        $unit = Warehouse::create(['code' => 'UNIT-01', 'name' => 'Unit Satu', 'type' => 'unit', 'main_warehouse_id' => $main->id]);
        $manager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $main->id]);
        $otherManager = User::factory()->create(['role' => UserRole::UnitManager, 'warehouse_id' => $main->id]);
        $requester = User::factory()->create(['role' => UserRole::UnitUser, 'warehouse_id' => $unit->id]);
        $item = Item::create(['code' => 'SJ-ITEM', 'name' => 'Barang Surat Jalan', 'base_uom' => 'PCS']);
        $stockRequest = StockRequest::create([
            'number' => 'REQ-SJ-001', 'type' => 'unit_request', 'from_warehouse_id' => $main->id,
            'to_warehouse_id' => $unit->id, 'request_date' => now(), 'status' => 'received', 'requested_by' => $requester->id,
        ]);
        $requestDetail = $stockRequest->details()->create(['item_id' => $item->id, 'qty_requested' => 2, 'qty_approved' => 2]);
        $delivery = Delivery::create([
            'number' => 'DO-SJ-001', 'stock_request_id' => $stockRequest->id, 'delivery_date' => now(),
            'status' => 'received', 'delivered_by' => $requester->id,
        ]);
        $delivery->details()->create([
            'stock_request_detail_id' => $requestDetail->id, 'item_id' => $item->id, 'qty_delivered' => 2,
        ]);
        $approval = WorkflowApproval::create([
            'module' => 'stock_request', 'transaction_id' => $stockRequest->id, 'transaction_no' => $stockRequest->number,
            'status' => 'approved', 'current_level' => 1, 'total_levels' => 1, 'created_by' => $requester->id,
        ]);
        $approval->steps()->create([
            'level' => 1, 'stage_key' => 'warehouse_manager', 'stage_label' => 'Approval manajer gudang',
            'approver_id' => $manager->id, 'acted_by' => $manager->id, 'status' => 'approved', 'acted_at' => now(),
        ]);

        $response = $this->actingAs($manager)->get(route('stock-requests.delivery-note', $stockRequest));
        $response->assertOk()->assertHeader('content-type', 'application/pdf');
        $this->assertStringStartsWith('%PDF-', $response->getContent());
        $this->assertSame(1, $delivery->fresh()->download_count);
        $this->actingAs($manager)->get('/approvals')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('approvalHistory.0.delivery_note_download_count', 1));
        $this->actingAs($otherManager)->get(route('stock-requests.delivery-note', $stockRequest))->assertForbidden();
        $this->actingAs($requester)->get(route('stock-requests.delivery-note', $stockRequest))->assertForbidden();
        $this->assertSame(1, $delivery->fresh()->download_count);
    }
}
