import React from 'react';
import { useParams } from 'react-router-dom';
import { FileText, AlertCircle } from 'lucide-react';
import { useLabResults } from '../hooks/useLabResults';
import { LoadingSpinner } from './LoadingSpinner';
import type { Database } from '../types/supabase';

type LabResult = Database['public']['Tables']['lab_results']['Row'];

export function LabResults() {
  const { id: patientId } = useParams<{ id: string }>();

  if (!patientId) {
    return (
      <div className="bg-yellow-50 p-4 rounded-lg">
        <p className="text-yellow-700">No patient ID provided</p>
      </div>
    );
  }

  const { results, loading, error } = useLabResults(patientId);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-700">Error loading lab results: {error.message}</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 p-8 text-center">
        <p className="text-gray-500">No lab results found for this patient</p>
      </div>
    );
  }

  const categorizedResults = results.reduce((acc, result) => {
    if (!acc[result.category]) {
      acc[result.category] = [];
    }
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, LabResult[]>);

  const getStatusColor = (status: LabResult['status']) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-100 text-green-800';
      case 'Abnormal':
        return 'bg-yellow-100 text-yellow-800';
      case 'Critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {Object.entries(categorizedResults).map(([category, categoryResults]) => (
          <div key={category} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center">
                <FileText className="h-5 w-5 text-gray-500" />
                <h3 className="ml-2 text-lg font-medium text-gray-900">{category}</h3>
              </div>
            </div>
            <div className="divide-y divide-gray-200">
              {categoryResults.map((result) => (
                <div key={result.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {result.test_name}
                      </h4>
                      <div className="mt-1 flex items-baseline space-x-2">
                        <span className="text-lg font-medium text-gray-900">
                          {result.result}
                        </span>
                        {result.unit && (
                          <span className="text-sm text-gray-500">{result.unit}</span>
                        )}
                      </div>
                      {result.reference_range && (
                        <p className="mt-1 text-sm text-gray-500">
                          Reference: {result.reference_range}
                        </p>
                      )}
                      {result.notes && (
                        <div className="mt-2 flex items-start space-x-1">
                          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                          <p className="text-sm text-gray-600">{result.notes}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          result.status
                        )}`}
                      >
                        {result.status}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(result.resulted_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}