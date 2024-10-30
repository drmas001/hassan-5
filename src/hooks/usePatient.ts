import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../types/supabase';

type Patient = Database['public']['Tables']['patients']['Row'];

export function usePatient(patientId: string) {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPatient() {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('patients')
          .select('*')
          .eq('id', patientId)
          .single();

        if (supabaseError) throw supabaseError;
        if (!data) throw new Error('Patient not found');

        setPatient(data);
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch patient'));
        toast.error('Failed to load patient data');
      } finally {
        setLoading(false);
      }
    }

    if (patientId) {
      fetchPatient();
    }
  }, [patientId]);

  return { patient, loading, error };
}