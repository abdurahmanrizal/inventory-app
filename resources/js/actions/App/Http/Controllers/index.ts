import DashboardController from './DashboardController'
import NotificationController from './NotificationController'
import WarehouseStockController from './WarehouseStockController'
import TransactionActivityController from './TransactionActivityController'
import InventoryReportController from './InventoryReportController'
import UserManagementController from './UserManagementController'
import WarehouseManagementController from './WarehouseManagementController'
import AccessManagementController from './AccessManagementController'
import StockTransactionController from './StockTransactionController'
import ApprovalController from './ApprovalController'
import OperationsController from './OperationsController'
import Settings from './Settings'

const Controllers = {
    DashboardController: Object.assign(DashboardController, DashboardController),
    NotificationController: Object.assign(NotificationController, NotificationController),
    WarehouseStockController: Object.assign(WarehouseStockController, WarehouseStockController),
    TransactionActivityController: Object.assign(TransactionActivityController, TransactionActivityController),
    InventoryReportController: Object.assign(InventoryReportController, InventoryReportController),
    UserManagementController: Object.assign(UserManagementController, UserManagementController),
    WarehouseManagementController: Object.assign(WarehouseManagementController, WarehouseManagementController),
    AccessManagementController: Object.assign(AccessManagementController, AccessManagementController),
    StockTransactionController: Object.assign(StockTransactionController, StockTransactionController),
    ApprovalController: Object.assign(ApprovalController, ApprovalController),
    OperationsController: Object.assign(OperationsController, OperationsController),
    Settings: Object.assign(Settings, Settings),
}

export default Controllers