<?php

namespace App\Http\Middleware;

use App\Actions\Fortify\SendSmsOtp;
use Closure;
use Illuminate\Http\Request;

class SendSmsOtpOn2FA
{
    public function __construct(private SendSmsOtp $sendSmsOtp)
    {
    }

    public function handle(Request $request, Closure $next)
    {
        $response = $next($request);

        // After successful login, if user has 2FA enabled, send SMS OTP
        if ($request->path() === 'login' && $request->method() === 'POST') {
            if (auth()->check() && auth()->user()->two_factor_confirmed_at) {
                ($this->sendSmsOtp)(auth()->user());
            }
        }

        return $response;
    }
}
