import React, { useState } from 'react';
import { Users, Plus } from 'lucide-react';
import { UserList } from './UserList';
import { CreateUserForm } from './CreateUserForm';
import { useUsers } from '../hooks/useUsers';
import { LoadingSpinner } from './LoadingSpinner';

export function AdminPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { users, loading, deleteUser } = useUsers();

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Users className="h-6 w-6 text-blue-500" />
          <h1 className="ml-2 text-2xl font-bold text-gray-900">Employee Management</h1>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </div>

      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <CreateUserForm onClose={() => setShowCreateForm(false)} />
          </div>
        </div>
      )}

      <UserList users={users} onDelete={deleteUser} />
    </div>
  );
}