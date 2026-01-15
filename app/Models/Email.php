<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Email extends Model
{
    protected $fillable = [
        'lead_id',
        'campaign_id',
        'sequence_number',
        'sent_time',
        'opened_time',
        'replied_time',
        'clicked_time',
        'replied_message',
        'open_count',
        'click_count',
        'sent_email',
        'is_unsubscribed'
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
