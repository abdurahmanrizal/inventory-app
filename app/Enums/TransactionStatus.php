<?php
namespace App\Enums;

enum TransactionStatus: string
{
    case Draft = 'draft';
    case WaitingApproval = 'waiting_approval';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
}
