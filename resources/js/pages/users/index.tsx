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
import { AlertCircle, Plus, Edit2, Trash2, User, Building2 } from 'lucide-react';

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

export default function UsersIndex() {
  const { users } = usePage().props as any;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const userTypeColors = {
    admin: 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200',
    agent: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
  };

  const userTypeLabels = {
    admin: 'Administrator',
    agent: 'Agent',
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDelete = () => {
    if (!selectedUser) return;
    router.delete(`/users/${selectedUser.id}`, {
      onSuccess: () => {
        setIsDeleteOpen(false);
        setSelectedUser(null);
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Users</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage system users and assign companies to agents
            </p>
          </div>
          <Button
            onClick={() => router.visit('/users/create')}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.length > 0 ? (
            users.map((user: User) => (
              <Card key={user.id} className="hover:shadow-lg dark:hover:shadow-xl transition-shadow border border-gray-200 dark:border-gray-700">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <CardTitle className="text-base truncate text-gray-900 dark:text-gray-50">
                          {user.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                        userTypeColors[user.type]
                      }`}
                    >
                      {userTypeLabels[user.type]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Company Assignment for Agents */}
                  {user.type === 'agent' && user.company && (
                    <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                      <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs text-gray-600 dark:text-gray-400">Company</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-50 truncate">
                          {user.company.name}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.visit(`/users/${user.id}/edit`)}
                      className="flex-1 gap-2"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(user)}
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
              <p className="text-gray-500 dark:text-gray-400 text-lg">No users found</p>
              <p className="text-gray-400 dark:text-gray-500 mt-1">
                Create your first user to get started
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{' '}
              <strong>{selectedUser?.name}</strong>? This action cannot be undone.
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
