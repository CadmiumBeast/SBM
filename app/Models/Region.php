<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Region extends Model
{
    protected $fillable = ['name', 'company_id'];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
    public function accounts()
    {
        return $this->hasMany(Account::class);
    }
    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }
}
