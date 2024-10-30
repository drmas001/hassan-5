import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import toast from 'react-hot-toast';

type Medication = Database['public']['Tables']['medications']['Row'];

export function useMedications(patientId: string) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchMedications() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('medications')
          .select(`
            *,
            prescriber:users!medications_prescribed_by_fkey(name)
          `)
          .eq('patient_id', patientId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (mounted) {
          setMedications(data || []);
        }
      } catch (error) {
        console.error('Error fetching medications:', error);
        toast.error('Failed to load medications');
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchMedications();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`medications_${patientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'medications',
          filter: `patient_id=eq.${patientId}`
        },
        async (payload) => {
          if (!mounted) return;

          if (payload.eventType === 'INSERT') {
            // Fetch the complete medication record with prescriber details
            const { data } = await supabase
              .from('medications')
              .select(`
                *,
                prescriber:users!medications_prescribed_by_fkey(name)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setMedications(current => [data, ...current]);
              toast.success('New medication added');
            }
          } else if (payload.eventType === 'UPDATE') {
            // Fetch updated medication to get prescriber details
            const { data } = await supabase
              .from('medications')
              .select(`
                *,
                prescriber:users!medications_prescribed_by_fkey(name)
              `)
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setMedications(current =>
                current.map(med =>
                  med.id === payload.new.id ? data : med
                )
              );
              toast.success('Medication updated');
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

  const updateMedicationStatus = async (medicationId: string, newStatus: Medication['status']) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({
          status: newStatus,
          end_date: newStatus !== 'Active' ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', medicationId);

      if (error) throw error;

      // Create notification
      const userString = localStorage.getItem('user');
      if (!userString) return;
      const user = JSON.parse(userString);

      const medication = medications.find(m => m.id === medicationId);
      if (medication) {
        await supabase.from('notifications').insert([
          {
            type: 'medication',
            message: `Medication ${medication.name} ${newStatus.toLowerCase()}`,
            severity: 'info',
            user_id: user.id,
            patient_id: patientId,
          },
        ]);
      }

      toast.success(`Medication ${newStatus.toLowerCase()}`);
    } catch (error) {
      console.error('Error updating medication:', error);
      toast.error('Failed to update medication');
    }
  };

  return {
    medications,
    loading,
    updateMedicationStatus,
  };
}