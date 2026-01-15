<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ContentController;
use App\Models\Company;
use App\Models\ContentCalender;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
});

Route::middleware(['auth', 'user-access:admin'])->group(function () {
    Route::resource('companies', \App\Http\Controllers\CompanyController::class);
    Route::resource('regions', \App\Http\Controllers\RegionController::class);
    Route::resource('tiers', \App\Http\Controllers\TierController::class);
    
    // Account routes
    Route::get('/accounts', [\App\Http\Controllers\AcountController::class, 'index'])->name('accounts.index');
    Route::post('/accounts', [\App\Http\Controllers\AcountController::class, 'store'])->name('accounts.store');
    
});

Route::post('/content-feedback/{calendarId}', [ContentController::class, 'feedback'])->name('content-feedback.store');
Route::post('/content-calendar', [ContentController::class, 'store'])->name('content-calendar.store');

require __DIR__.'/settings.php';
