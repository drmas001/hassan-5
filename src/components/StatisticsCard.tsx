import React from 'react';
import { Users, AlertCircle, CheckCircle, Clock, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Statistics {
  totalPatients: number;
  criticalPatients: number;
  stablePatients: number;
  newAdmissions: number;
  dischargedToday: number;
}

interface StatisticsCardProps {
  stats: Statistics;
}

export function StatisticsCard({ stats }: StatisticsCardProps) {
  const navigate = useNavigate();

  const handleStatClick = (filter: string) => {
    navigate(`/patients?filter=${filter}`);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      <div 
        onClick={() => handleStatClick('all')}
        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center">
          <div className="bg-blue-100 rounded-lg p-2">
            <Users className="h-6 sm:h-8 w-6 sm:w-8 text-blue-600" />
          </div>
          <div className="ml-3 sm:ml-4">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Patients</p>
            <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.totalPatients}</p>
          </div>
        </div>
      </div>

      <div 
        onClick={() => handleStatClick('critical')}
        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center">
          <div className="bg-red-100 rounded-lg p-2">
            <AlertCircle className="h-6 sm:h-8 w-6 sm:w-8 text-red-600" />
          </div>
          <div className="ml-3 sm:ml-4">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Critical</p>
            <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.criticalPatients}</p>
          </div>
        </div>
      </div>

      <div 
        onClick={() => handleStatClick('stable')}
        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center">
          <div className="bg-green-100 rounded-lg p-2">
            <CheckCircle className="h-6 sm:h-8 w-6 sm:w-8 text-green-600" />
          </div>
          <div className="ml-3 sm:ml-4">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Stable</p>
            <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.stablePatients}</p>
          </div>
        </div>
      </div>

      <div 
        onClick={() => handleStatClick('new')}
        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center">
          <div className="bg-purple-100 rounded-lg p-2">
            <Clock className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600" />
          </div>
          <div className="ml-3 sm:ml-4">
            <p className="text-xs sm:text-sm font-medium text-gray-600">New Today</p>
            <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.newAdmissions}</p>
          </div>
        </div>
      </div>

      <div 
        onClick={() => handleStatClick('discharged')}
        className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow"
      >
        <div className="flex items-center">
          <div className="bg-gray-100 rounded-lg p-2">
            <LogOut className="h-6 sm:h-8 w-6 sm:w-8 text-gray-600" />
          </div>
          <div className="ml-3 sm:ml-4">
            <p className="text-xs sm:text-sm font-medium text-gray-600">Discharged Today</p>
            <p className="text-lg sm:text-2xl font-semibold text-gray-900">{stats.dischargedToday}</p>
          </div>
        </div>
      </div>
    </div>
  );
}