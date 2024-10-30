import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import toast from 'react-hot-toast';

type Vitals = Database['public']['Tables']['vitals']['Row'];

export function useVitals(patientId: string) {
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchVitals() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('vitals')
          .select(`
            *,
            recorder:users!vitals_recorded_by_fkey(name)
          `)
          .eq('patient_id', patientId)
          .order('recorded_at', { ascending: false });

        if (error) throw error;
        if (mounted) {
          setVitals(data || []);
        }
      } catch (error) {
        console.error('Error fetching vitals:', error);
        toast.error('Failed to load vitals');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchVitals();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel(`vitals_${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vitals',
          filter: `patient_id=eq.${patientId}`
        },
        async (payload) => {
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            // Fetch the complete vital record with recorder details
            const { data } = await supabase
              .from('vitals')
              .select(`
                *,
                recorder:users!vitals_recorded_by_fkey(name)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setVitals(current => [data, ...current]);
              toast.success('New vitals recorded');

              // Check for critical values
              const newVitals = payload.new as Vitals;
              if (
                newVitals.heart_rate > 120 || 
                newVitals.heart_rate < 60 ||
                newVitals.oxygen_saturation < 90 ||
                newVitals.temperature > 38.5
              ) {
                toast.error('Critical vital signs detected!');
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

  return { vitals, loading };
}