import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteCase } from '@/lib/types';

interface UseCasesOptions {
  limit?: number;
  enabled?: boolean;
}

let channelCounter = 0;

export const useCases = (options?: UseCasesOptions) => {
  const enabled = options?.enabled ?? true;
  const [cases, setCases] = useState<SiteCase[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchCases = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('s_cases')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true });

        if (options?.limit) {
          query = query.limit(options.limit);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw supabaseError;
        }

        setCases(data || []);
      } catch (err) {
        console.error('Error fetching cases:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar cases');
      } finally {
        setLoading(false);
      }
    };

    fetchCases();

    const channel = supabase
      .channel(`s_cases_${++channelCounter}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 's_cases',
        },
        () => {
          fetchCases();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, options?.limit]);

  return { cases, loading, error };
};
