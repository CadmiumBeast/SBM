<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Http\Controllers\ContentController;
use App\Http\Controllers\AcountController;
use App\Models\Company;
use App\Models\ContentCalender;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', function () {
        $contentCalendars = ContentCalender::with('user')->orderBy('scheduled_date', 'desc')->paginate(10);
        return Inertia::render('dashboard', [
            'contentCalendars' => $contentCalendars,
            'canCreateContentCalendar' => true,
        ]);
    })->name('dashboard');
});

Route::middleware(['auth', 'user-access:admin'])->group(function () {
    Route::resource('companies', \App\Http\Controllers\CompanyController::class);
    Route::resource('regions', \App\Http\Controllers\RegionController::class);
    Route::resource('tiers', \App\Http\Controllers\TierController::class);
    
    // Account routes
    Route::get('/accounts', [AcountController::class, 'index'])->name('accounts.index');
    Route::post('/accounts', [AcountController::class, 'store'])->name('accounts.store');
    Route::post('/accounts/import', [AcountController::class, 'import'])->name('accounts.import');

    // User management routes
    Route::resource('users', \App\Http\Controllers\UserController::class);
    
});

Route::middleware(['auth'])->group(function () {
    Route::get('/two-factor', [App\Http\Controllers\TwoFactorController::class, 'show']);
    Route::post('/two-factor/enable', [App\Http\Controllers\TwoFactorController::class, 'enable']);
    Route::post('/two-factor/verify', [App\Http\Controllers\TwoFactorController::class, 'verify']);
    
    // SMS OTP 2FA routes
    Route::post('/sms-otp/send', [App\Http\Controllers\SmsOtpController::class, 'sendOtp'])->name('sms-otp.send');
    Route::post('/sms-otp/verify', [App\Http\Controllers\SmsOtpController::class, 'verifyOtp'])->name('sms-otp.verify');
});

// SMS 2FA challenge routes (guest routes for login flow)
Route::post('/sms-otp/challenge', [App\Http\Controllers\SmsOtpController::class, 'challenge'])->name('sms-otp.challenge');
Route::post('/sms-otp/verify-challenge', [App\Http\Controllers\SmsOtpController::class, 'verifyChallengeCode'])->name('sms-otp.verify-challenge');

Route::post('/content-feedback/{calendarId}', [ContentController::class, 'feedback'])->name('content-feedback.store');
Route::post('/content-calendar', [ContentController::class, 'store'])->name('content-calendar.store');

require __DIR__.'/settings.php';
