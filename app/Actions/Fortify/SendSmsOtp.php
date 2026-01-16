<?php

namespace App\Actions\Fortify;

use App\Models\User;
use App\Services\SmsOtpService;

class SendSmsOtp
{
    public function __construct(private SmsOtpService $smsOtpService)
    {
    }

    /**
     * Send SMS OTP to user during 2FA challenge
     */
    public function __invoke(User $user): void
    {
        if (!$user->two_factor_confirmed_at || !$user->phone_number) {
            return;
        }

        try {
            $otp = $this->smsOtpService->sendOtp($user->phone_number);
            
            $user->update([
                'sms_otp_code' => $otp,
                'sms_otp_expires_at' => now()->addMinutes(10)
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send SMS OTP', [
                'user_id' => $user->id,
                'error' => $e->getMessage()
            ]);
        }
    }
}
