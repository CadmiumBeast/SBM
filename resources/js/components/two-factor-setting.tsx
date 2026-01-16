import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
    twoFaEnabled: boolean;
}

export default function TwoFactorSettings({ twoFaEnabled }: Props) {
    const [showSetup, setShowSetup] = useState(false);

    return (
        <div className="py-6">
            <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Two-Factor Authentication
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Add an extra layer of security to your account.
                </p>
            </div>

            <div className="mt-4">
                {twoFaEnabled ? (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            ✓ Two-factor authentication is enabled
                        </p>
                        <Button
                            variant="destructive"
                            className="mt-4"
                        >
                            Disable 2FA
                        </Button>
                    </div>
                ) : (
                    <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                            Two-factor authentication is not enabled
                        </p>
                        <Button
                            onClick={() => setShowSetup(true)}
                            className="mt-4"
                        >
                            Enable 2FA
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}