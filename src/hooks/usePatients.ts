import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { differenceInHours } from 'date-fns';

interface Patient {
  id: string;
  mrn: string;
  name: string;
  age: number;
  diagnosis: string;
  bed_number: string;
  status: string;
  admission_date: string;
  updated_at: string;
}

interface UsePatients {
  patients: Patient[];
  loading: boolean;
  error: Error | null;
}

export function usePatients(): UsePatients {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const shouldShowPatient = (patient: Patient) => {
    const now = new Date();
    const lastUpdate = new Date(patient.updated_at);
    const hoursSinceUpdate = differenceInHours(now, lastUpdate);

    // Show discharged patients for 48 hours after discharge
    if (patient.status === 'Discharged') {
      return hoursSinceUpdate <= 48;
    }

    // Always show active patients
    return true;
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('patients')
          .select('*')
          .order('updated_at', { ascending: false });

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        // Filter patients based on status and time
        const filteredPatients = (data || []).filter(shouldShowPatient);
        setPatients(filteredPatients);
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching patients:', error);
        setError(error);
        toast.error('Failed to load patients');
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('patients')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patients' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const newPatient = payload.new as Patient;
          if (shouldShowPatient(newPatient)) {
            setPatients((current) => [newPatient, ...current]);
            toast.success('New patient admitted');
          }
        } else if (payload.eventType === 'UPDATE') {
          const updatedPatient = payload.new as Patient;
          setPatients((current) =>
            current
              .map((patient) =>
                patient.id === updatedPatient.id ? updatedPatient : patient
              )
              .filter(shouldShowPatient)
          );
          
          if (updatedPatient.status === 'Discharged') {
            toast.success('Patient discharged');
          } else {
            toast.success('Patient information updated');
          }
        } else if (payload.eventType === 'DELETE') {
          setPatients((current) =>
            current.filter((patient) => patient.id !== payload.old.id)
          );
          toast.success('Patient record removed');
        }
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { patients, loading, error };
}