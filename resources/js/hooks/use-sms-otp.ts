import { useCallback } from 'react';
import { router } from '@inertiajs/react';

export const OTP_MAX_LENGTH = 6;

export function useTwoFactorAuth() {
    const sendOtp = useCallback(
        (phoneNumber: string) => {
            return new Promise((resolve, reject) => {
                router.post(
                    '/sms-otp/send',
                    { phone_number: phoneNumber },
                    {
                        onSuccess: (page) => {
                            resolve(page.props.message);
                        },
                        onError: (errors) => {
                            reject(errors);
                        },
                    }
                );
            });
        },
        []
    );

    const verifyOtp = useCallback(
        (code: string) => {
            return new Promise((resolve, reject) => {
                router.post(
                    '/sms-otp/verify',
                    { otp_code: code },
                    {
                        onSuccess: (page) => {
                            resolve(page.props.message);
                        },
                        onError: (errors) => {
                            reject(errors);
                        },
                    }
                );
            });
        },
        []
    );

    const sendChallenge = useCallback(
        (email: string, password: string) => {
            return new Promise((resolve, reject) => {
                router.post(
                    '/sms-otp/challenge',
                    { email, password },
                    {
                        onSuccess: (page) => {
                            resolve(page.props.message);
                        },
                        onError: (errors) => {
                            reject(errors);
                        },
                    }
                );
            });
        },
        []
    );

    const verifyChallengeCode = useCallback(
        (email: string, code: string) => {
            return new Promise((resolve, reject) => {
                router.post(
                    '/sms-otp/verify-challenge',
                    { email, otp_code: code },
                    {
                        onSuccess: (page) => {
                            resolve(page.props.message);
                        },
                        onError: (errors) => {
                            reject(errors);
                        },
                    }
                );
            });
        },
        []
    );

    return {
        sendOtp,
        verifyOtp,
        sendChallenge,
        verifyChallengeCode,
    };
}
