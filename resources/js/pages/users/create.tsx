import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { router } from '@inertiajs/react';

interface Company {
  id: number;
  name: string;
}

interface CreatePageProps {
  companies: Company[];
}

export default function CreateUser({ companies }: CreatePageProps) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    email: '',
    password: '',
    type: 'admin' as 'admin' | 'agent',
    company_id: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    post('/users', {
      onSuccess: () => {
        router.visit('/users');
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
            onClick={() => router.visit('/users')}
            className="mb-4 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Create New User</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Add a new user to the system</p>
        </div>

        {/* Form Card */}
        <Card className="border border-gray-200 dark:border-gray-700 w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-gray-50">User Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="John Doe"
                  className={errors.name ? 'border-red-500' : ''}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="john@example.com"
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={data.password}
                  onChange={(e) => setData('password', e.target.value)}
                  placeholder="••••••••"
                  className={errors.password ? 'border-red-500' : ''}
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              <div>
                <Label htmlFor="type">User Type *</Label>
                <Select
                  value={data.type}
                  onValueChange={(value: any) => {
                    setData('type', value);
                    if (value !== 'agent') {
                      setData('company_id', '');
                    }
                  }}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Company Selection for Agents */}
              {data.type === 'agent' && (
                <div>
                  <Label htmlFor="company_id">Assign Company *</Label>
                  <Select
                    value={data.company_id}
                    onValueChange={(value) => setData('company_id', value)}
                  >
                    <SelectTrigger id="company_id">
                      <SelectValue placeholder="Select a company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.company_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.company_id}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.visit('/users')}
                  disabled={processing}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={processing} className="flex-1">
                  {processing ? 'Creating...' : 'Create User'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
    </AppLayout>
  );
}
