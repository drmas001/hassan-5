import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import toast from 'react-hot-toast';

type User = Database['public']['Tables']['users']['Row'];

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('users_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setUsers((current) => [...current, payload.new as User]);
          } else if (payload.eventType === 'DELETE') {
            setUsers((current) =>
              current.filter((user) => user.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load employees');
    } finally {
      setLoading(false);
    }
  }

  async function deleteUser(userId: string) {
    try {
      // First, get a fallback admin user
      const { data: adminUser, error: adminError } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'Admin')
        .neq('id', userId)
        .single();

      if (adminError) {
        toast.error('Cannot delete the last admin user');
        return;
      }

      // Update patients to reassign them to the fallback admin
      const { error: updateError } = await supabase
        .from('patients')
        .update({ attending_physician_id: adminUser.id })
        .eq('attending_physician_id', userId);

      if (updateError) throw updateError;

      // Now delete the user
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) throw deleteError;

      toast.success('Employee deleted successfully');
      
      // Update local state
      setUsers(current => current.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete employee');
    }
  }

  return {
    users,
    loading,
    deleteUser,
  };
}