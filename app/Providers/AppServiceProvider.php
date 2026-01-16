<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use App\Models\Email;
use App\Models\Connection;
use App\Observers\EmailObserver;
use App\Observers\ConnectionObserver;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Register model observers for engagement score tracking
        Email::observe(EmailObserver::class);
        Connection::observe(ConnectionObserver::class);
    }
}
