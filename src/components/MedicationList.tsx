import React from 'react';
import { Pill, Clock, AlertCircle } from 'lucide-react';
import type { Database } from '../types/supabase';

type Medication = Database['public']['Tables']['medications']['Row'];

interface MedicationListProps {
  medications: Medication[];
  onUpdateStatus: (medicationId: string, newStatus: Medication['status']) => void;
}

export function MedicationList({ medications, onUpdateStatus }: MedicationListProps) {
  const getStatusColor = (status: Medication['status']) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Discontinued':
        return 'bg-red-100 text-red-800';
      case 'Completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {medications.map((medication) => (
        <div
          key={medication.id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Pill className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-gray-900">{medication.name}</h4>
                <p className="text-sm text-gray-600">
                  {medication.dosage} - {medication.route}
                </p>
                <p className="text-sm text-gray-600">
                  Frequency: {medication.frequency}
                </p>
                {medication.notes && (
                  <div className="mt-2 flex items-start space-x-1">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <p className="text-sm text-gray-600">{medication.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                  medication.status
                )}`}
              >
                {medication.status}
              </span>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>
                  Started:{' '}
                  {new Date(medication.start_date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          {medication.status === 'Active' && (
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => onUpdateStatus(medication.id, 'Completed')}
                className="text-sm text-green-600 hover:text-green-800"
              >
                Mark Complete
              </button>
              <button
                onClick={() => onUpdateStatus(medication.id, 'Discontinued')}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Discontinue
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}