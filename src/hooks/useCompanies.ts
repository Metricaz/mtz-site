import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Company } from '@/lib/types';

/**
 * Hook para buscar empresas clientes (com logos)
 * Usado na seção "Quem Confia"
 */
export const useCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('s_companies')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true });

        if (supabaseError) {
          throw supabaseError;
        }

        setCompanies(data || []);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar empresas');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('s_companies')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 's_companies',
          filter: 'is_active=eq.true',
        },
        (payload) => {
          console.log('Real-time company update:', payload);
          // Refetch companies when there's a change
          fetchCompanies();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { companies, loading, error };
};
