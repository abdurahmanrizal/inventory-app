<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WorkflowApprovalStep extends Model
{
    protected $fillable = ['workflow_approval_id', 'level', 'stage_key', 'stage_label', 'approver_id', 'acted_by', 'status', 'remarks', 'acted_at'];

    protected $casts = ['acted_at' => 'datetime'];

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approver_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acted_by');
    }
}
