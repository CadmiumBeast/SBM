<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Connection extends Model
{
    protected $fillable = [
        'lead_id',
        'sender',
        'last_action_taken',
        'last_action_date',
        'senders_status',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }
}
