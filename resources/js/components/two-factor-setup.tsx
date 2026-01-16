import { FormEventHandler, useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AuthLayout from '@/layouts/auth-layout';

export default function TwoFactorSetup() {
    const [step, setStep] = useState<'phone' | 'verify'>('phone');
    const { data, setData, post, processing, errors } = useForm({
        phone_number: '',
        otp_code: '',
    });

    const handlePhoneSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/two-factor/enable', {
            onSuccess: () => setStep('verify'),
        });
    };

    const handleVerifySubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/two-factor/verify', {
            onSuccess: () => {
                window.location.href = '/dashboard';
            },
        });
    };

    return (
        <AuthLayout
            title={step === 'phone' ? 'Enter Phone Number' : 'Verify Code'}
            description={
                step === 'phone'
                    ? 'We will send a verification code to your phone'
                    : 'Check your phone for the 6-digit code'
            }
        >
            <Head title="Setup Two-Factor Authentication" />

            <div className="space-y-4">
                {step === 'phone' ? (
                    <form
                        onSubmit={handlePhoneSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label htmlFor="phone_number" className="text-sm font-medium">
                                Phone Number
                            </label>
                            <Input
                                id="phone_number"
                                type="tel"
                                placeholder="+1 (202) 555-0134"
                                value={data.phone_number}
                                onChange={(e) =>
                                    setData('phone_number', e.currentTarget.value)
                                }
                                required
                                className="mt-2"
                            />
                            <InputError message={errors.phone_number} />
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full"
                        >
                            {processing ? 'Sending...' : 'Send OTP'}
                        </Button>
                    </form>
                ) : (
                    <form
                        onSubmit={handleVerifySubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label htmlFor="otp_code" className="text-sm font-medium">
                                Verification Code
                            </label>
                            <Input
                                id="otp_code"
                                type="text"
                                inputMode="numeric"
                                placeholder="000000"
                                maxLength={6}
                                value={data.otp_code}
                                onChange={(e) =>
                                    setData('otp_code', e.currentTarget.value)
                                }
                                required
                                className="mt-2"
                            />
                            <InputError message={errors.otp_code} />
                        </div>

                        <Button
                            type="submit"
                            disabled={processing}
                            className="w-full"
                        >
                            {processing ? 'Verifying...' : 'Verify & Enable 2FA'}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setStep('phone')}
                            className="w-full"
                        >
                            Change Phone Number
                        </Button>
                    </form>
                )}
            </div>
        </AuthLayout>
    );
}