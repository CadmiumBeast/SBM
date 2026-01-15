<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Engagement extends Model
{
    protected $fillable = [
        'company_id',
        'start_date',
        'end_date',
        'page_posts',
        'impressions',
        'reactions',
        'comments',
        'reposts',
        'engagement',
        'linkedin_page_views',
        'linkedin_unique_visitors',
        'company_followers',
        'search_appearance_product',
        'search_appearance_contact_us',
        'newsletter_subscriptions',
        'newsletter_articles'
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }
}
