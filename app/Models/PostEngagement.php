<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PostEngagement extends Model
{
    protected $fillable = [
        'lead_id',
        'campaign_id',
        'reaction',
        'member_id',
    ];

    public function lead()
    {
        return $this->belongsTo(Lead::class);
    }

    public function campaign()
    {
        return $this->belongsTo(Campaign::class);
    }
}
