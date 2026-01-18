import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function CreateTier() {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/tiers', {
      onSuccess: () => {
        router.visit('/tiers');
      },
    });
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-slate-50 dark:bg-slate-900/80">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit('/tiers')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Tiers
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Create New Tier</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Add a new tier level to the system</p>
          </div>

          {/* Form Card */}
          <Card className="border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-50">Tier Information</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="name">Tier Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., Premium, Enterprise, Starter"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.visit('/tiers')}
                    disabled={processing}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={processing} className="flex-1">
                    {processing ? 'Creating...' : 'Create Tier'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
    </AppLayout>
  );
}
