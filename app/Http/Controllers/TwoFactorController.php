<?php

namespace App\Http\Controllers;

use App\Actions\Fortify\EnableTwoFactor;
use App\Actions\Fortify\VerifyTwoFactor;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TwoFactorController extends Controller
{
    public function show()
    {
        return Inertia::render('auth/two-factor-challenge', [
            'twoFaEnabled' => auth()->user()->two_fa_enabled
        ]);
    }

    public function enable(Request $request, EnableTwoFactor $enableTwoFactor)
    {
        $validated = $request->validate([
            'phone_number' => 'required|string'
        ]);

        return $enableTwoFactor(auth()->user(), $validated['phone_number']);
    }

    public function verify(Request $request, VerifyTwoFactor $verifyTwoFactor)
    {
        $validated = $request->validate([
            'otp_code' => 'required|string|size:6'
        ]);

        return $verifyTwoFactor(auth()->user(), $validated['otp_code']);
    }
}
