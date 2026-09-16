import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { TeamMember } from '@/lib/types';

interface UseTeamOptions {
  enabled?: boolean;
}

/**
 * Hook para buscar membros do time
 * Usado na seção "Quem constrói com você"
 */
export const useTeam = (options?: UseTeamOptions) => {
  const enabled = options?.enabled ?? true;
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchTeam = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('s_team')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true });

        if (supabaseError) {
          throw supabaseError;
        }

        setTeam(data || []);
      } catch (err) {
        console.error('Error fetching team:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar time');
      } finally {
        setLoading(false);
      }
    };

    fetchTeam();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('s_team')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 's_team',
          filter: 'is_active=eq.true',
        },
        (payload) => {
          console.log('Real-time team update:', payload);
          // Refetch team when there's a change
          fetchTeam();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled]);

  return { team, loading, error };
};
