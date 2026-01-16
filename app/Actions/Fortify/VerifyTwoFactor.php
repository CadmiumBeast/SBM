<?php
namespace App\Actions\Fortify;

use App\Services\TwoFactorService;
use Illuminate\Validation\ValidationException;

class VerifyTwoFactor
{
    protected $twoFactorService;

    public function __construct(TwoFactorService $twoFactorService)
    {
        $this->twoFactorService = $twoFactorService;
    }

    public function __invoke($user, $otp)
    {
        if (!$this->twoFactorService->verifyOtp($user, $otp)) {
            throw ValidationException::withMessages([
                'otp_code' => ['Invalid or expired OTP.']
            ]);
        }

        $user->update([
            'two_fa_enabled' => true,
            'otp_code' => null,
            'otp_expires_at' => null
        ]);

        return ['message' => '2FA enabled successfully'];
    }
}