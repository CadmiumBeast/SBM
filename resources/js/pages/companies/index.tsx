import React, { useState } from 'react';
import { usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Plus, Edit2, Trash2, Building2 } from 'lucide-react';

interface Company {
  id: number;
  name: string;
}

export default function CompaniesIndex() {
  const { companies } = usePage().props as any;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleDeleteClick = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedCompany) return;
    router.delete(`/companies/${selectedCompany.id}`, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedCompany(null);
      },
    });
  };

  return (
    <AppLayout>
      <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6 bg-slate-50 dark:bg-slate-900/80">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Companies</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage all companies in the system
              </p>
            </div>
            <Button
              onClick={() => router.visit('/companies/create')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Company
            </Button>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.length > 0 ? (
              companies.map((company: Company) => (
                <Card key={company.id} className="hover:shadow-lg dark:hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate text-gray-900 dark:text-gray-50">
                            {company.name}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.visit(`/companies/${company.id}/edit`)}
                        className="flex-1 gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(company)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full py-12 text-center">
                <AlertCircle className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No companies found</p>
                <p className="text-gray-400 dark:text-gray-500 mt-1">
                  Create your first company to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Company</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedCompany?.name}</strong>? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setIsDeleteOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
