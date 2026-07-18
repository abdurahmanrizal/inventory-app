<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Approval extends Model
{
    protected $fillable = ['stock_transaction_id', 'level', 'approver_id', 'status', 'remarks', 'acted_at'];

    protected $casts = ['acted_at' => 'datetime'];
}
