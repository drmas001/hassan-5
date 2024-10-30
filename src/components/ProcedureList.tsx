import React from 'react';
import { Stethoscope, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import type { Database } from '../types/supabase';

type Procedure = Database['public']['Tables']['procedures']['Row'] & {
  performer?: {
    name: string;
  };
};

interface ProcedureListProps {
  procedures: Procedure[];
}

export function ProcedureList({ procedures }: ProcedureListProps) {
  const getOutcomeIcon = (outcome: string) => {
    switch (outcome) {
      case 'Successful':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Partially Successful':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'Unsuccessful':
      case 'Abandoned':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (procedures.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
        <p className="text-gray-500">No procedures recorded yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {procedures.map((procedure) => (
        <div
          key={procedure.id}
          className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <Stethoscope className="h-5 w-5 text-blue-500 mt-1" />
              <div>
                <h4 className="text-lg font-medium text-gray-900">{procedure.name}</h4>
                <p className="text-sm text-gray-500">{procedure.category}</p>
                <p className="mt-2 text-sm text-gray-600">{procedure.description}</p>
                
                {procedure.complications && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-red-600">Complications:</p>
                    <p className="text-sm text-gray-600">{procedure.complications}</p>
                  </div>
                )}

                {procedure.notes && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-600">Notes:</p>
                    <p className="text-sm text-gray-600">{procedure.notes}</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-2">
                {getOutcomeIcon(procedure.outcome)}
                <span className="text-sm font-medium text-gray-600">
                  {procedure.outcome}
                </span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-1" />
                <span>{new Date(procedure.created_at).toLocaleString()}</span>
              </div>
              {procedure.performer && (
                <p className="text-sm text-gray-500">
                  By: {procedure.performer.name}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}