import React from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit2, Trash2, Building2 } from 'lucide-react';

interface Company {
  id: number;
  name: string;
}

interface Region {
  id: number;
  name: string;
  company_id: number;
  company?: Company;
}

export default function ShowRegion() {
  const { region, company } = usePage().props as any;

  return (
    <AppLayout>
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-slate-50 dark:bg-slate-900/80">
        <div className="max-w-2xl mx-auto w-full">
          {/* Header */}
          <div className="mb-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.visit('/regions')}
              className="mb-4 gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Regions
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">{region.name}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Region details</p>
          </div>

          {/* Region Card */}
          <Card className="border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-50">Region Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                <p className="text-gray-900 dark:text-gray-50 mt-2 text-lg">{region.name}</p>
              </div>

              {/* Company Information */}
              {company && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Company</label>
                  </div>
                  <p className="text-gray-900 dark:text-gray-50 text-lg ml-7">{company.name}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => router.visit(`/regions/${region.id}/edit`)}
                  className="flex-1 gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${region.name}?`)) {
                      router.delete(`/regions/${region.id}`);
                    }
                  }}
                  className="flex-1 gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
