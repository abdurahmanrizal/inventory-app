<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WorkflowApproval extends Model
{
    protected $fillable = ['module', 'transaction_id', 'transaction_no', 'status', 'current_level', 'total_levels', 'created_by'];

    public function steps(): HasMany
    {
        return $this->hasMany(WorkflowApprovalStep::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
