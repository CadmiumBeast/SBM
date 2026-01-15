<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Lead extends Model
{
    protected $fillable = [
        'first_name',
        'last_name',
        'full_name',
        'headline',
        'job_title',
        'location',
        'work_email',
        'engagement_score',
        'priority',
        'follow_company',
        'account_id',
    ];

    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    public function connections()
    {
        return $this->hasMany(Connection::class);
    }

    public function emails()
    {
        return $this->hasMany(Email::class);
    }
    public function postEngagements()
    {
        return $this->hasMany(PostEngagement::class);
    }
}
