<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkflowApprovalStep extends Model
{
    protected $fillable = ['workflow_approval_id', 'level', 'approver_id', 'status', 'remarks', 'acted_at'];

    protected $casts = ['acted_at' => 'datetime'];
}
