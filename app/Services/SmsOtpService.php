<?php

namespace App\Services;

use Illuminate\Support\Facades\Config;

class SmsOtpService
{
    /**
     * Send OTP via SMS using Twilio
     */
    public function sendOtp(string $phoneNumber): string
    {
        $otp = $this->generateOtp();
        
        try {
            $this->sendSms($phoneNumber, "Your verification code is: $otp. Valid for 10 minutes.");
            return $otp;
        } catch (\Exception $e) {
            \Log::error('SMS OTP send failed', [
                'phone' => $phoneNumber,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    /**
     * Generate a 6-digit OTP
     */
    public function generateOtp(): string
    {
        return str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    }

    /**
     * Verify OTP is valid and not expired
     */
    public function verifyOtp(string $userOtp, string $storedOtp, ?\DateTime $expiresAt): bool
    {
        if ($userOtp !== $storedOtp) {
            return false;
        }

        if ($expiresAt === null || now()->isAfter($expiresAt)) {
            return false;
        }

        return true;
    }

    /**
     * Send SMS via Twilio
     */
    private function sendSms(string $phoneNumber, string $message): void
    {
        $accountSid = config('services.twilio.account_sid');
        $authToken = config('services.twilio.auth_token');
        $fromNumber = config('services.twilio.phone_number');

        if (!$accountSid || !$authToken || !$fromNumber) {
            throw new \Exception('Twilio credentials not configured');
        }

        $client = new \Twilio\Rest\Client($accountSid, $authToken);

        $client->messages->create(
            $phoneNumber,
            [
                'from' => $fromNumber,
                'body' => $message
            ]
        );
    }
}
