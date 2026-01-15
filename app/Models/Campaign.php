<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Campaign extends Model
{
    protected $fillable = [
        'company_id',
        'region_id',
        'name',
        'type',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function region()
    {
        return $this->belongsTo(Region::class);
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
