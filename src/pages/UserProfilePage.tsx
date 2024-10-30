import React from 'react';
import { useUser } from '../hooks/useUser';
import { User, Mail, Calendar, Shield } from 'lucide-react';

export function UserProfilePage() {
  const user = useUser();

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 sm:px-6 py-4 sm:py-5">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">
            User Profile
          </h3>
          <p className="mt-1 max-w-2xl text-xs sm:text-sm text-gray-500">
            Personal details and role information.
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 sm:px-6 py-4 sm:py-5">
          <dl className="grid grid-cols-1 gap-4 sm:gap-x-4 sm:gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <User className="h-4 w-4 mr-2" />
                Full Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 break-words">{user.name}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                Employee Code
              </dt>
              <dd className="mt-1 text-sm text-gray-900">{user.employee_code}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Role
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user.role === 'Doctor' ? 'Physician' : user.role}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500 flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Last Login
              </dt>
              <dd className="mt-1 text-sm text-gray-900">
                {new Date().toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}