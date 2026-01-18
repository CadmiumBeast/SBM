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

interface User {
  id: number;
  name: string;
  email: string;
  type: 'admin' | 'agent';
  company_id: number | null;
  company?: {
    id: number;
    name: string;
  };
}

interface Company {
  id: number;
  name: string;
}

interface EditPageProps {
  user: User;
  companies: Company[];
}

export default function EditUser({ user, companies }: EditPageProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: user.name,
    email: user.email,
    password: '',
    type: user.type,
    company_id: user.company_id?.toString() || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    put(`/users/${user.id}`, {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Edit User</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Update user information</p>
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
                  className={errors.email ? 'border-red-500' : ''}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div>
                <Label htmlFor="password">
                  Password <span className="text-xs text-gray-500 dark:text-gray-400">(leave blank to keep current)</span>
                </Label>
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
                  {processing ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        </div>
    </AppLayout>
  );
}
