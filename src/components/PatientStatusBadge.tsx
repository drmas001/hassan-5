import React from 'react';
import { Activity } from 'lucide-react';

interface PatientStatusBadgeProps {
  status: string;
  onStatusChange?: (newStatus: 'Stable' | 'Critical') => Promise<void>;
  showDropdown?: boolean;
}

export function PatientStatusBadge({ status, onStatusChange, showDropdown = false }: PatientStatusBadgeProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Critical':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Stable':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Discharged':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!showDropdown || status === 'Discharged') {
    return (
      <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
        <Activity className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
        {status}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <select
        value={status}
        onChange={(e) => onStatusChange?.(e.target.value as 'Stable' | 'Critical')}
        className={`appearance-none cursor-pointer inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
          status
        )} pr-6 sm:pr-7 border-0 focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        <option value="Stable">Stable</option>
        <option value="Critical">Critical</option>
      </select>
      <Activity className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4" />
    </div>
  );
}