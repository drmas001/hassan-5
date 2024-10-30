import React from 'react';
import { useUser } from '../hooks/useUser';

export function UserProfile() {
  const user = useUser();

  if (!user) return null;

  // Format display name
  const formatName = (employeeCode: string, name: string) => {
    if (employeeCode.startsWith('Dr')) {
      return `Dr. ${name.split(' ')[0]}`;
    }
    return name.split(' ')[0];
  };

  // Format role display
  const formatRole = (role: string) => {
    switch (role) {
      case 'Doctor':
        return 'Physician';
      case 'Nurse':
        return 'Nurse';
      case 'Admin':
        return 'Administrator';
      default:
        return role;
    }
  };

  // Generate initials for avatar
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const displayName = formatName(user.employee_code, user.name);
  const displayRole = formatRole(user.role);

  return (
    <div className="flex items-center">
      <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-blue-600 flex items-center justify-center">
        <span className="text-xs sm:text-sm font-medium text-white">{initials}</span>
      </div>
      <div className="ml-2 sm:ml-3 min-w-0">
        <p className="text-xs sm:text-sm font-medium text-gray-700 truncate">{displayName}</p>
        <p className="text-xs text-gray-500 truncate">{displayRole}</p>
      </div>
    </div>
  );
}