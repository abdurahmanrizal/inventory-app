<?php
namespace App\Enums;

enum TransactionType: string
{
    case StockIn = 'stock_in';
    case StockOut = 'stock_out';
    case Transfer = 'transfer';
    case Opname = 'opname';
    case Adjustment = 'adjustment';
}
