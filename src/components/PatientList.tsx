import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PatientStatusBadge } from './PatientStatusBadge';
import { LoadingSpinner } from './LoadingSpinner';
import { usePatients } from '../hooks/usePatients';
import { format } from 'date-fns';

export function PatientList() {
  const navigate = useNavigate();
  const { patients, loading, error } = usePatients();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">Error loading patients: {error.message}</p>
      </div>
    );
  }

  if (!patients || patients.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No patients found</p>
      </div>
    );
  }

  const handlePatientClick = (patientId: string) => {
    navigate(`/patients/${patientId}`);
  };

  // Sort patients: Active patients first (Stable/Critical), then Discharged
  const sortedPatients = [...patients].sort((a, b) => {
    if (a.status === 'Discharged' && b.status !== 'Discharged') return 1;
    if (a.status !== 'Discharged' && b.status === 'Discharged') return -1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      {/* Mobile List View */}
      <div className="lg:hidden">
        {sortedPatients.map((patient) => (
          <div
            key={patient.id}
            className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
              patient.status === 'Discharged' ? 'bg-gray-50' : ''
            }`}
            onClick={() => handlePatientClick(patient.id)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-sm font-medium text-gray-900 truncate">
                    {patient.name}
                  </h3>
                  <PatientStatusBadge status={patient.status} />
                </div>
                <p className="mt-1 text-xs text-gray-500">MRN: {patient.mrn}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Bed: {patient.status === 'Discharged' ? '-' : patient.bed_number}
                </p>
                <p className="mt-1 text-xs text-gray-500 truncate">
                  {patient.diagnosis}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 ml-4 flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MRN/Patient
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bed
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diagnosis
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">View</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPatients.map((patient) => (
              <tr 
                key={patient.id} 
                className={`hover:bg-gray-50 cursor-pointer ${
                  patient.status === 'Discharged' ? 'bg-gray-50' : ''
                }`}
                onClick={() => handlePatientClick(patient.id)}
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                    <div className="text-sm text-gray-500">MRN: {patient.mrn}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {patient.status === 'Discharged' ? '-' : patient.bed_number}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {patient.diagnosis}
                </td>
                <td className="px-6 py-4">
                  <PatientStatusBadge status={patient.status} />
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {format(new Date(patient.updated_at), 'MMM d, yyyy HH:mm')}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}