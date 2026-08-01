<?php

use App\Http\Controllers\AccessManagementController;
use App\Http\Controllers\ApprovalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\InventoryReportController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\OperationsController;
use App\Http\Controllers\StockTransactionController;
use App\Http\Controllers\TransactionActivityController;
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\WarehouseStockController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route(
    auth()->check() ? 'dashboard' : 'login',
))->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('notifications/{notification}/read', [NotificationController::class, 'read'])->name('notifications.read');
    Route::patch('notifications/read-all', [NotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::get('warehouse-stocks', WarehouseStockController::class)->middleware('permission:stock.view')->name('warehouse-stocks.index');
    Route::get('transaction-activities', TransactionActivityController::class)->middleware('permission:activity.view')->name('transaction-activities.index');
    Route::get('reports', InventoryReportController::class)->middleware('permission:report.view')->name('reports.index');
    Route::get('reports/export/{format}', [InventoryReportController::class, 'export'])->middleware('permission:report.view')->name('reports.export');
    Route::get('user-management', [UserManagementController::class, 'index'])->name('user-management.index');
    Route::post('user-management', [UserManagementController::class, 'store'])->name('user-management.store');
    Route::put('user-management/{user}', [UserManagementController::class, 'update'])->name('user-management.update');
    Route::delete('user-management/{user}', [UserManagementController::class, 'destroy'])->name('user-management.destroy');
    Route::get('access-management', [AccessManagementController::class, 'index'])->name('access-management.index');
    Route::get('role-management', [AccessManagementController::class, 'roles'])->name('role-management.index');
    Route::get('permission-management', [AccessManagementController::class, 'permissions'])->name('permission-management.index');
    Route::put('access-management/{role}', [AccessManagementController::class, 'update'])->name('access-management.update');
    Route::post('access-management/roles', [AccessManagementController::class, 'storeRole'])->name('access-management.roles.store');
    Route::put('access-management/roles/{role}', [AccessManagementController::class, 'updateRole'])->name('access-management.roles.update');
    Route::delete('access-management/roles/{role}', [AccessManagementController::class, 'destroyRole'])->name('access-management.roles.destroy');
    Route::post('access-management/permissions', [AccessManagementController::class, 'storePermission'])->name('access-management.permissions.store');
    Route::put('access-management/permissions/{permission}', [AccessManagementController::class, 'updatePermission'])->name('access-management.permissions.update');
    Route::delete('access-management/permissions/{permission}', [AccessManagementController::class, 'destroyPermission'])->name('access-management.permissions.destroy');
    Route::get('stock-transactions', [StockTransactionController::class, 'index'])->name('stock-transactions.index');
    Route::post('stock-transactions', [StockTransactionController::class, 'store'])->name('stock-transactions.store');
    Route::get('stock-transactions/{transaction}/document', [StockTransactionController::class, 'document'])->name('stock-transactions.document');
    Route::get('stock-transactions/{transaction}/evidence/{kind}', [StockTransactionController::class, 'evidence'])->name('stock-transactions.evidence');
    Route::get('approvals', [ApprovalController::class, 'index'])->middleware('permission:approval.act')->name('approvals.index');
    Route::post('approvals/{transaction}/approve', [ApprovalController::class, 'approve'])->middleware('permission:approval.act')->name('approvals.approve');
    Route::post('approvals/{transaction}/reject', [ApprovalController::class, 'reject'])->middleware('permission:approval.act')->name('approvals.reject');
    Route::get('operations/{module}', [OperationsController::class, 'index'])->name('operations.index');
    Route::get('stock-requests', [OperationsController::class, 'stockRequests'])->name('stock-requests.index');
    Route::get('stock-requests/{stockRequest}/delivery-note', [OperationsController::class, 'deliveryNote'])->name('stock-requests.delivery-note');
    Route::post('operations/master-data/suppliers', [OperationsController::class, 'supplier'])->middleware('permission:master.manage');
    Route::post('operations/master-data/uoms', [OperationsController::class, 'uom'])->middleware('permission:master.manage');
    Route::post('operations/master-data/locations', [OperationsController::class, 'location'])->middleware('permission:master.manage');
    Route::post('operations/master-data/items', [OperationsController::class, 'item'])->middleware('permission:master.manage');
    Route::post('operations/master-data/items/import', [OperationsController::class, 'importItems'])->middleware('permission:master.manage')->name('master-items.import');
    Route::get('operations/master-data/items/import-template', [OperationsController::class, 'itemImportTemplate'])->middleware('permission:master.manage')->name('master-items.import-template');
    Route::put('operations/master-data/suppliers/{supplier}', [OperationsController::class, 'updateSupplier']);
    Route::put('operations/master-data/uoms/{uom}', [OperationsController::class, 'updateUom']);
    Route::put('operations/master-data/locations/{location}', [OperationsController::class, 'updateLocation']);
    Route::put('operations/master-data/items/{item}', [OperationsController::class, 'updateItem']);
    Route::post('operations/fulfillment/requests', [OperationsController::class, 'stockRequest'])->middleware('permission:stock.request');
    Route::post('operations/fulfillment/requests/{stockRequest}/prepare', [OperationsController::class, 'prepareStockRequest'])->middleware('permission:stock.ship');
    Route::post('operations/fulfillment/deliveries', [OperationsController::class, 'delivery'])->middleware('permission:stock.ship');
    Route::post('operations/fulfillment/receipts', [OperationsController::class, 'receipt'])->middleware('permission:stock.receive');
    Route::post('operations/inventory-control/adjustments', [OperationsController::class, 'adjustment'])->middleware('permission:stock.adjust');
    Route::post('operations/inventory-control/opnames', [OperationsController::class, 'opname'])->middleware('permission:stock.adjust');
    Route::post('workflow-approvals/{approval}', [OperationsController::class, 'approval'])->middleware('permission:approval.act')->name('workflow-approvals.act');
});

require __DIR__.'/settings.php';
