<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    protected $fillable = ['name'];
   
    public function regions()
    {
        return $this->hasMany(Region::class);
    }

    public function accounts()
    {
        return $this->hasMany(Account::class);
    }
    public function campaigns()
    {
        return $this->hasMany(Campaign::class);
    }

    public function engagements()
    {
        return $this->hasMany(Engagement::class);
    }

    public function contentCalenders()
    {
        return $this->hasMany(ContentCalender::class);
    }
}
