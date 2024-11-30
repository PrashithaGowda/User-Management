"use client";

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { UserDialog } from '@/components/UserDialog';
import { DataTable } from '@/components/ui/data-table';
import { SearchBar } from '@/components/ui/search-bar';
import { Pagination } from '@/components/ui/pagination';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api';
import { User } from '@/lib/types';
import { useUsersStore } from '@/lib/store';
import { toast } from 'sonner';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  
  const { currentPage, searchQuery, setSearchQuery, setCurrentPage } = useUsersStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', currentPage],
    queryFn: () => getUsers(currentPage),
  });

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDialogOpen(false);
      toast.success('User created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<User> }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsDialogOpen(false);
      toast.success('User updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleAddUser = () => {
    setSelectedUser(undefined);
    setDialogMode('create');
    setIsDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setDialogMode('edit');
    setIsDialogOpen(true);
  };

  const handleDeleteUser = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await deleteMutation.mutateAsync(id);
    }
  };

  const handleDialogSubmit = async (formData: Partial<User>) => {
    try {
      if (dialogMode === 'create') {
        await createMutation.mutateAsync(formData as Omit<User, 'id'>);
      } else if (selectedUser) {
        await updateMutation.mutateAsync({ id: selectedUser.id, data: formData });
      }
    } catch (error) {
      console.error('Operation failed:', error);
    }
  };

  const filteredUsers = data?.data?.filter(user => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.name.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  }) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <Button onClick={handleAddUser}>Add User</Button>
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      <DataTable
        users={filteredUsers}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />

      <Pagination
        currentPage={currentPage}
        totalPages={data?.total_pages || 1}
        onPageChange={setCurrentPage}
      />

      <UserDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleDialogSubmit}
        user={selectedUser}
        mode={dialogMode}
      />
    </div>
  );
}