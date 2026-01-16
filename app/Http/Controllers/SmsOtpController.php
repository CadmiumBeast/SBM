<?php

namespace App\Http\Controllers;

use App\Services\SmsOtpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SmsOtpController extends Controller
{
    public function __construct(private SmsOtpService $smsOtpService)
    {
    }

    /**
     * Send OTP to user's phone number
     */
    public function sendOtp(Request $request): JsonResponse
    {
        $request->validate([
            'phone_number' => 'required|string|regex:/^\+?[1-9]\d{1,14}$/'
        ]);

        $user = auth()->user();
        
        // Generate and send OTP
        $otp = $this->smsOtpService->sendOtp($request->phone_number);

        // Store OTP temporarily
        $user->update([
            'phone_number' => $request->phone_number,
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10)
        ]);

        return response()->json([
            'message' => 'OTP sent to your phone number',
            'phone_number' => $request->phone_number
        ]);
    }

    /**
     * Verify OTP code
     */
    public function verifyOtp(Request $request): JsonResponse
    {
        $request->validate([
            'otp_code' => 'required|string|size:6'
        ]);

        $user = auth()->user();

        if (!$user->phone_number) {
            throw ValidationException::withMessages([
                'otp_code' => ['Phone number not registered.']
            ]);
        }

        $isValid = $this->smsOtpService->verifyOtp(
            $request->otp_code,
            $user->sms_otp_code,
            $user->sms_otp_expires_at
        );

        if (!$isValid) {
            throw ValidationException::withMessages([
                'otp_code' => ['Invalid or expired OTP code.']
            ]);
        }

        // Clear OTP after successful verification
        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null,
            'two_factor_confirmed_at' => now()
        ]);

        return response()->json([
            'message' => 'SMS OTP verified successfully',
            'two_factor_confirmed' => true
        ]);
    }

    /**
     * Handle SMS-based 2FA challenge during login
     */
    public function challenge(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string'
        ]);

        // Find user by email
        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user || !\Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.']
            ]);
        }

        if (!$user->two_factor_confirmed_at) {
            throw ValidationException::withMessages([
                'email' => ['2FA not enabled on this account.']
            ]);
        }

        // Send OTP to user's registered phone
        $otp = $this->smsOtpService->sendOtp($user->phone_number);

        $user->update([
            'otp_code' => $otp,
            'otp_expires_at' => now()->addMinutes(10)
        ]);

        return response()->json([
            'message' => 'OTP sent to your phone',
            'requires_verification' => true
        ]);
    }

    /**
     * Verify 2FA challenge code
     */
    public function verifyChallengeCode(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp_code' => 'required|string|size:6'
        ]);

        $user = \App\Models\User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['User not found.']
            ]);
        }

        $isValid = $this->smsOtpService->verifyOtp(
            $request->otp_code,
            $user->sms_otp_code,
            $user->sms_otp_expires_at
        );

        if (!$isValid) {
            throw ValidationException::withMessages([
                'otp_code' => ['Invalid or expired OTP code.']
            ]);
        }

        // Clear OTP
        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null
        ]);

        // Log user in
        auth()->login($user);

        return response()->json([
            'message' => '2FA verification successful',
            'authenticated' => true
        ]);
    }
}
