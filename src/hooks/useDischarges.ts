import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import toast from 'react-hot-toast';

type Discharge = Database['public']['Tables']['discharges']['Row'] & {
  patient_name?: string;
  patient_mrn?: string;
};

interface UseDischarges {
  discharges: Discharge[];
  loading: boolean;
  error: Error | null;
}

export function useDischarges(patientId?: string): UseDischarges {
  const [discharges, setDischarges] = useState<Discharge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDischarges = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = supabase
          .from('discharges')
          .select(`
            *,
            patient:patients (
              name,
              mrn
            )
          `)
          .order('discharge_date', { ascending: false });

        if (patientId) {
          query.eq('patient_id', patientId);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw new Error(supabaseError.message);
        }

        // Transform the data to include patient name and MRN directly in the discharge object
        const transformedData = data?.map(discharge => ({
          ...discharge,
          patient_name: discharge.patient?.name,
          patient_mrn: discharge.patient?.mrn,
        })) || [];

        setDischarges(transformedData);
      } catch (err) {
        const error = err as Error;
        console.error('Error fetching discharges:', error);
        setError(error);
        toast.error('Failed to load discharge records');
      } finally {
        setLoading(false);
      }
    };

    fetchDischarges();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('discharges_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'discharges',
          ...(patientId ? { filter: `patient_id=eq.${patientId}` } : {}),
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            // Fetch the complete discharge record with patient details
            const { data } = await supabase
              .from('discharges')
              .select(`
                *,
                patient:patients (
                  name,
                  mrn
                )
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              const transformedDischarge = {
                ...data,
                patient_name: data.patient?.name,
                patient_mrn: data.patient?.mrn,
              };
              setDischarges(current => [transformedDischarge, ...current]);
              toast.success('New discharge record added');
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  return { discharges, loading, error };
}