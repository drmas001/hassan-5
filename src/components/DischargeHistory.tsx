import React from 'react';
import { format } from 'date-fns';
import { FileText, Calendar, User } from 'lucide-react';
import { useDischarges } from '../hooks/useDischarges';
import { LoadingSpinner } from './LoadingSpinner';

export function DischargeHistory() {
  const { discharges, loading, error } = useDischarges();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">Error loading discharge records: {error.message}</p>
      </div>
    );
  }

  if (!discharges || discharges.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No discharge records found</p>
      </div>
    );
  }

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'Improved':
        return 'bg-green-100 text-green-800';
      case 'Stable':
        return 'bg-blue-100 text-blue-800';
      case 'Deteriorated':
        return 'bg-yellow-100 text-yellow-800';
      case 'Deceased':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Discharge History
        </h3>
      </div>
      <div className="divide-y divide-gray-200">
        {discharges.map((discharge) => (
          <div key={discharge.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {discharge.patient_name}
                  </p>
                  <p className="text-sm text-gray-500">MRN: {discharge.patient_mrn}</p>
                </div>
              </div>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionColor(
                  discharge.discharge_condition
                )}`}
              >
                {discharge.discharge_condition}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="flex items-center text-sm font-medium text-gray-900 mb-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  Dates
                </h4>
                <div className="space-y-1 text-sm text-gray-500">
                  <p>
                    Discharged:{' '}
                    {format(new Date(discharge.discharge_date), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="flex items-center text-sm font-medium text-gray-900 mb-2">
                  <FileText className="h-4 w-4 mr-1" />
                  Diagnosis
                </h4>
                <p className="text-sm text-gray-500">
                  {discharge.discharge_diagnosis}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Summary</h4>
              <p className="text-sm text-gray-500">{discharge.discharge_summary}</p>
            </div>

            {discharge.discharge_medications && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Discharge Medications
                </h4>
                <p className="text-sm text-gray-500">
                  {discharge.discharge_medications}
                </p>
              </div>
            )}

            {discharge.follow_up_instructions && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Follow-up Instructions
                </h4>
                <p className="text-sm text-gray-500">
                  {discharge.follow_up_instructions}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}