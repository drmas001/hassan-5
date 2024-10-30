import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { PatientStatusBadge } from './PatientStatusBadge';
import { LoadingSpinner } from './LoadingSpinner';
import { VitalsChart } from './VitalsChart';
import { MedicationList } from './MedicationList';
import { LabResults } from './LabResults';
import { ProcedureList } from './ProcedureList';
import { DischargeForm } from './DischargeForm';
import { AddVitalsForm } from './AddVitalsForm';
import { AddMedicationForm } from './AddMedicationForm';
import { AddLabResultForm } from './AddLabResultForm';
import { AddProcedureForm } from './AddProcedureForm';
import { useVitals } from '../hooks/useVitals';
import { useMedications } from '../hooks/useMedications';
import { useLabResults } from '../hooks/useLabResults';
import { useProcedures } from '../hooks/useProcedures';
import {
  Heart,
  Thermometer,
  Wind,
  Clock,
  User,
  FileText,
  Activity,
  Pill,
  TestTube,
  Hash,
  Bed,
  Stethoscope,
  ClipboardList,
  Plus,
  LogOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type Patient = Database['public']['Tables']['patients']['Row'];

export function PatientDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'medications' | 'labs' | 'procedures' | 'discharge'>('overview');
  const [showDischargeForm, setShowDischargeForm] = useState(false);
  const [showAddVitalsForm, setShowAddVitalsForm] = useState(false);
  const [showAddMedicationForm, setShowAddMedicationForm] = useState(false);
  const [showAddLabResultForm, setShowAddLabResultForm] = useState(false);
  const [showAddProcedureForm, setShowAddProcedureForm] = useState(false);

  const { vitals, loading: vitalsLoading } = useVitals(id || '');
  const { medications, loading: medsLoading, updateMedicationStatus } = useMedications(id || '');
  const { results: labResults, loading: labsLoading } = useLabResults(id || '');
  const { procedures, loading: proceduresLoading } = useProcedures(id || '');

  useEffect(() => {
    async function fetchPatient() {
      try {
        if (!id) {
          toast.error('No patient ID provided');
          navigate('/dashboard');
          return;
        }

        const { data, error } = await supabase
          .from('patients')
          .select(`
            *,
            attending_physician:users!patients_attending_physician_id_fkey (
              name,
              employee_code
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        if (!data) {
          toast.error('Patient not found');
          navigate('/dashboard');
          return;
        }

        setPatient(data);
      } catch (error) {
        console.error('Error fetching patient:', error);
        toast.error('Failed to load patient data');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    }

    fetchPatient();
  }, [id, navigate]);

  const handleStatusChange = async (newStatus: 'Stable' | 'Critical') => {
    try {
      if (!patient || !id) return;

      const { error } = await supabase
        .from('patients')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setPatient((prev) => prev ? { ...prev, status: newStatus } : null);

      // Show success message
      toast.success(`Patient status updated to ${newStatus}`);

      // Create notification
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const user = JSON.parse(userString);

      await supabase.from('notifications').insert([
        {
          type: 'status',
          message: `Patient ${patient.name} status changed to ${newStatus}`,
          severity: newStatus === 'Critical' ? 'critical' : 'info',
          user_id: user.id,
          patient_id: id,
        },
      ]);
    } catch (error) {
      console.error('Error updating patient status:', error);
      toast.error('Failed to update patient status');
    }
  };

  const handleDischarge = () => {
    setShowDischargeForm(true);
    setActiveTab('discharge');
  };

  const handleDischargeComplete = () => {
    setShowDischargeForm(false);
    setActiveTab('overview');
    navigate('/dashboard');
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!patient) {
    return null;
  }

  const latestVitals = vitals[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Patient Header */}
      <div className="bg-white shadow-sm rounded-lg p-4 sm:p-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center">
            <User className="h-8 sm:h-12 w-8 sm:w-12 text-blue-500" />
            <div className="ml-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{patient.name}</h2>
                <span className="text-sm text-gray-500">
                  <Hash className="h-4 w-4 inline" /> {patient.mrn}
                </span>
              </div>
              <div className="mt-1 flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-sm text-gray-500">
                <span>{patient.age} years</span>
                <span className="hidden sm:inline">•</span>
                <span>{patient.gender}</span>
                <span className="hidden sm:inline">•</span>
                <span>
                  <Bed className="h-4 w-4 inline mr-1" />
                  Bed {patient.bed_number}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <PatientStatusBadge 
              status={patient.status} 
              onStatusChange={handleStatusChange}
              showDropdown={patient.status !== 'Discharged'} 
            />
            {patient.status !== 'Discharged' && (
              <button
                onClick={handleDischarge}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Discharge Patient
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-4 sm:mb-6 overflow-x-auto">
        <nav className="-mb-px flex space-x-4 sm:space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FileText className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('vitals')}
            className={`${
              activeTab === 'vitals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Activity className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
            Vitals
          </button>
          <button
            onClick={() => setActiveTab('medications')}
            className={`${
              activeTab === 'medications'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Pill className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
            Medications
          </button>
          <button
            onClick={() => setActiveTab('labs')}
            className={`${
              activeTab === 'labs'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <TestTube className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
            Lab Results
          </button>
          <button
            onClick={() => setActiveTab('procedures')}
            className={`${
              activeTab === 'procedures'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <Stethoscope className="h-4 sm:h-5 w-4 sm:w-5 mr-2" />
            Procedures
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4 sm:space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-4 sm:space-y-6">
            {/* Diagnosis */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <Stethoscope className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
                <h3 className="ml-2 text-base sm:text-lg font-medium text-gray-900">Diagnosis</h3>
              </div>
              <p className="text-sm text-gray-600">{patient.diagnosis}</p>
            </div>

            {/* History */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <FileText className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
                <h3 className="ml-2 text-base sm:text-lg font-medium text-gray-900">History</h3>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{patient.history}</p>
            </div>

            {/* Examination */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <ClipboardList className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
                <h3 className="ml-2 text-base sm:text-lg font-medium text-gray-900">Physical Examination</h3>
              </div>
              <p className="text-sm text-gray-600 whitespace-pre-line">{patient.examination}</p>
            </div>

            {/* Notes */}
            {patient.notes && (
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center mb-3 sm:mb-4">
                  <FileText className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
                  <h3 className="ml-2 text-base sm:text-lg font-medium text-gray-900">Additional Notes</h3>
                </div>
                <p className="text-sm text-gray-600 whitespace-pre-line">{patient.notes}</p>
              </div>
            )}

            {/* Admission Details */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center mb-3 sm:mb-4">
                <Clock className="h-4 sm:h-5 w-4 sm:w-5 text-gray-500" />
                <h3 className="ml-2 text-base sm:text-lg font-medium text-gray-900">Admission Details</h3>
              </div>
              <div className="space-y-2">
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Admitted:</span>{' '}
                  {new Date(patient.admission_date).toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Attending Physician:</span>{' '}
                  {patient.attending_physician?.name}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  <span className="font-medium">Last Updated:</span>{' '}
                  {new Date(patient.updated_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddVitalsForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Vitals
              </button>
            </div>

            {vitalsLoading ? (
              <LoadingSpinner />
            ) : (
              <>
                {/* Latest Vitals */}
                {latestVitals && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <Heart className="h-6 sm:h-8 w-6 sm:w-8 text-red-500" />
                        <div className="ml-3 sm:ml-4">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Heart Rate</p>
                          <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                            {latestVitals.heart_rate} <span className="text-xs sm:text-sm text-gray-500">bpm</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <Wind className="h-6 sm:h-8 w-6 sm:w-8 text-blue-500" />
                        <div className="ml-3 sm:ml-4">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Oxygen Saturation</p>
                          <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                            {latestVitals.oxygen_saturation}%
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <Thermometer className="h-6 sm:h-8 w-6 sm:w-8 text-orange-500" />
                        <div className="ml-3 sm:ml-4">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Temperature</p>
                          <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                            {latestVitals.temperature}°C
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                      <div className="flex items-center">
                        <Activity className="h-6 sm:h-8 w-6 sm:w-8 text-purple-500" />
                        <div className="ml-3 sm:ml-4">
                          <p className="text-xs sm:text-sm font-medium text-gray-600">Blood Pressure</p>
                          <p className="text-lg sm:text-2xl font-semibold text-gray-900">
                            {latestVitals.blood_pressure}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Vitals Charts */}
                {vitals.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Heart Rate History</h3>
                      <VitalsChart
                        data={vitals}
                        metric="heart_rate"
                        color="#ef4444"
                        label="Heart Rate"
                        unit="bpm"
                      />
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200">
                      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">Oxygen Saturation History</h3>
                      <VitalsChart
                        data={vitals}
                        metric="oxygen_saturation"
                        color="#3b82f6"
                        label="SpO2"
                        unit="%"
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddMedicationForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Medication
              </button>
            </div>

            {medsLoading ? (
              <LoadingSpinner />
            ) : (
              <MedicationList
                medications={medications}
                onUpdateStatus={updateMedicationStatus}
              />
            )}
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddLabResultForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Lab Result
              </button>
            </div>

            {labsLoading ? (
              <LoadingSpinner />
            ) : (
              <LabResults results={labResults} />
            )}
          </div>
        )}

        {activeTab === 'procedures' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddProcedureForm(true)}
                className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Record Procedure
              </button>
            </div>

            {proceduresLoading ? (
              <LoadingSpinner />
            ) : (
              <ProcedureList procedures={procedures} />
            )}
          </div>
        )}

        {activeTab === 'discharge' && showDischargeForm && (
          <DischargeForm
            patient={patient}
            onDischarge={handleDischargeComplete}
          />
        )}
      </div>

      {/* Modal Forms */}
      {showAddVitalsForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <AddVitalsForm
              patientId={patient.id}
              onClose={() => setShowAddVitalsForm(false)}
            />
          </div>
        </div>
      )}

      {showAddMedicationForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <AddMedicationForm
              patientId={patient.id}
              onClose={() => setShowAddMedicationForm(false)}
            />
          </div>
        </div>
      )}

      {showAddLabResultForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <AddLabResultForm
              patientId={patient.id}
              onClose={() => setShowAddLabResultForm(false)}
            />
          </div>
        </div>
      )}

      {showAddProcedureForm && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-lg">
            <AddProcedureForm
              patientId={patient.id}
              onClose={() => setShowAddProcedureForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}