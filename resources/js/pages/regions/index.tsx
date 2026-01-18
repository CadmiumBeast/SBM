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
import { AlertCircle, Plus, Edit2, Trash2, MapPin, Building2 } from 'lucide-react';

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

export default function RegionsIndex() {
  const { regions } = usePage().props as any;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);

  const handleDeleteClick = (region: Region) => {
    setSelectedRegion(region);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedRegion) return;
    router.delete(`/regions/${selectedRegion.id}`, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedRegion(null);
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Regions</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage regions and assign them to companies
              </p>
            </div>
            <Button
              onClick={() => router.visit('/regions/create')}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Region
            </Button>
          </div>

          {/* Regions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regions.length > 0 ? (
              regions.map((region: Region) => (
                <Card key={region.id} className="hover:shadow-lg dark:hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="text-base truncate text-gray-900 dark:text-gray-50">
                            {region.name}
                          </CardTitle>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Company Assignment */}
                    {region.company && (
                      <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-xs text-gray-600 dark:text-gray-400">Company</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                            {region.company.name}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.visit(`/regions/${region.id}/edit`)}
                        className="flex-1 gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteClick(region)}
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
                <p className="text-gray-500 dark:text-gray-400 text-lg">No regions found</p>
                <p className="text-gray-400 dark:text-gray-500 mt-1">
                  Create your first region to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Region</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete <strong>{selectedRegion?.name}</strong>? This action cannot be undone.
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
