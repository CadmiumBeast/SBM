<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    protected $fillable = [
        'name',
        'domain',
        'visibility_score',
        'company_id',
        'tier_id',
        'region_id',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function tier()
    {
        return $this->belongsTo(Tier::class);
    }
    public function region()
    {
        return $this->belongsTo(Region::class);
    }

    public function leads()
    {
        return $this->hasMany(Lead::class);
    }
}

