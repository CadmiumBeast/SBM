<?php
namespace App\Actions\Fortify;

use App\Services\TwoFactorService;
use Illuminate\Validation\ValidationException;

class EnableTwoFactor
{
    protected $twoFactorService;

    public function __construct(TwoFactorService $twoFactorService)
    {
        $this->twoFactorService = $twoFactorService;
    }

    public function __invoke($user, $phoneNumber)
    {
        if (!$this->isValidPhone($phoneNumber)) {
            throw ValidationException::withMessages([
                'phone_number' => ['Invalid phone number format.']
            ]);
        }

        $otp = $this->twoFactorService->sendOtp($phoneNumber);
        
        $user->update([
            'phone_number' => $phoneNumber,
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10)
        ]);

        return ['message' => 'OTP sent to your phone'];
    }

    protected function isValidPhone($phone)
    {
        return preg_match('/^\+?[1-9]\d{1,14}$/', $phone);
    }
}