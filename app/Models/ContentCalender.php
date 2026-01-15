<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContentCalender extends Model
{
    protected $fillable = [
        'company_id',
        'date',
        'title',
        'description',
        'content_link',
        'type',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function feedbacks()
    {
        return $this->hasMany(ContentFeedback::class);
    }
}
