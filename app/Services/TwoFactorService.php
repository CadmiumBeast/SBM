<?php
// app/Services/TwoFactorService.php
namespace App\Services;

use Twilio\Rest\Client;

class TwoFactorService
{
    protected $twilio;

    public function __construct()
    {
        $this->twilio = new Client(
            config('services.twilio.account_sid'),
            config('services.twilio.auth_token')
        );
    }

    public function sendOtp($phoneNumber)
    {
        $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        
        $this->twilio->messages->create($phoneNumber, [
            'from' => config('services.twilio.phone_number'),
            'body' => "Your verification code is: $otp"
        ]);

        return $otp;
    }

    public function verifyOtp($user, $otp)
    {
        return $user->otp_code === $otp && 
               now()->lessThan($user->otp_expires_at);
    }
}