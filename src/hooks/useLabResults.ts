import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import toast from 'react-hot-toast';

type LabResult = Database['public']['Tables']['lab_results']['Row'];

export function useLabResults(patientId: string) {
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchLabResults() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('lab_results')
          .select(`
            *,
            orderer:users!lab_results_ordered_by_fkey(name)
          `)
          .eq('patient_id', patientId)
          .order('resulted_at', { ascending: false });

        if (error) throw error;
        if (mounted) {
          setResults(data || []);
        }
      } catch (error) {
        console.error('Error fetching lab results:', error);
        toast.error('Failed to load lab results');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchLabResults();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`lab_results_${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'lab_results',
          filter: `patient_id=eq.${patientId}`
        },
        async (payload) => {
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            // Fetch the complete lab result with orderer details
            const { data } = await supabase
              .from('lab_results')
              .select(`
                *,
                orderer:users!lab_results_ordered_by_fkey(name)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setResults(current => [data, ...current]);
              
              // Create notification
              const userString = localStorage.getItem('user');
              if (userString) {
                const user = JSON.parse(userString);
                const newResult = payload.new as LabResult;
                
                await supabase.from('notifications').insert([
                  {
                    type: 'lab',
                    message: `New ${newResult.test_name} result: ${newResult.status}`,
                    severity: newResult.status === 'Critical' ? 'critical' : 'info',
                    user_id: user.id,
                    patient_id: patientId,
                  },
                ]);
              }

              if ((payload.new as LabResult).status === 'Critical') {
                toast.error('Critical lab result received!');
              } else {
                toast.success('New lab result received');
              }
            }
          }
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [patientId]);

  return { results, loading };
}