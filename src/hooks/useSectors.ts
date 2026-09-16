import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Sector } from '@/lib/types';

export const useSectors = () => {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSectors = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('s_sectors')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true });

        if (supabaseError) {
          throw supabaseError;
        }

        setSectors(data || []);
      } catch (err) {
        console.error('Error fetching sectors:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar setores');
      } finally {
        setLoading(false);
      }
    };

    fetchSectors();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('s_sectors')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 's_sectors',
          filter: 'is_active=eq.true',
        },
        (payload) => {
          console.log('Real-time sector update:', payload);
          // Refetch sectors when there's a change
          fetchSectors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { sectors, loading, error };
};
