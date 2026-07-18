<?php
namespace App\Http\Controllers;
use App\Models\CurrentStock;
use App\Models\StockTransaction;
use App\Enums\TransactionStatus;
use Inertia\Inertia;
class DashboardController extends Controller
{
 public function __invoke(){
  $value=CurrentStock::query()->selectRaw('COALESCE(SUM(qty_on_hand * average_cost),0) total')->value('total');
  return Inertia::render('Dashboard/Index',[
   'stats'=>[
    'stockValue'=>(float)$value,
    'stockQty'=>(float)CurrentStock::sum('qty_on_hand'),
    'pendingApproval'=>StockTransaction::where('status',TransactionStatus::WaitingApproval)->count(),
    'lowStock'=>CurrentStock::whereColumn('qty_on_hand','<=','qty_reserved')->count(),
   ],
   'recent'=>StockTransaction::with(['sourceWarehouse:id,name','destinationWarehouse:id,name'])->latest()->limit(8)->get(),
  ]);
 }
}
