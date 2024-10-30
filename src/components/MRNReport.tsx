import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FileText, Download } from 'lucide-react';
import { generatePDF } from '../utils/pdfExport';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type Patient = Database['public']['Tables']['patients']['Row'];

export function MRNReport() {
  const navigate = useNavigate();
  const [mrn, setMrn] = useState('');
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);

  const handleSearch = async () => {
    if (!mrn.trim()) {
      toast.error('Please enter an MRN');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients')
        .select(`
          *,
          vitals:vitals(*, recorded_at),
          medications:medications(*),
          lab_results:lab_results(*),
          discharges:discharges(*)
        `)
        .eq('mrn', mrn.trim())
        .single();

      if (error) throw error;
      if (!data) {
        toast.error('No patient found with this MRN');
        return;
      }

      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      toast.error('Failed to fetch patient data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = () => {
    if (!patient) return;

    const reportData = {
      patient: {
        ...patient,
        admission_date: new Date(patient.admission_date).toLocaleDateString(),
        discharge_date: patient.discharges?.[0]?.discharge_date 
          ? new Date(patient.discharges[0].discharge_date).toLocaleDateString()
          : 'Not discharged',
      },
      vitals: patient.vitals,
      medications: patient.medications,
      labResults: patient.lab_results,
      discharge: patient.discharges?.[0],
    };

    generatePDF(reportData, `Patient-Report-${patient.mrn}`);
    toast.success('Report generated successfully');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="bg-white shadow-sm rounded-lg">
        <div className="px-4 py-5 border-b border-gray-200 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Patient Report by MRN
          </h3>
        </div>

        <div className="p-6">
          <div className="flex space-x-4">
            <input
              type="text"
              value={mrn}
              onChange={(e) => setMrn(e.target.value)}
              placeholder="Enter MRN"
              className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {patient && (
            <div className="mt-6 space-y-6">
              <div className="border-t border-gray-200 pt-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patient.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">MRN</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patient.mrn}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className="mt-1 text-sm text-gray-900">{patient.status}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Admission Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(patient.admission_date).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  View Details
                </button>
                <button
                  onClick={handleGenerateReport}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}