<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentFeedback extends Model
{
    protected $fillable = [
        'content_calender_id',
        'feedback',
        'user_id',
    ];

    public function contentCalender()
    {
        return $this->belongsTo(ContentCalender::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
