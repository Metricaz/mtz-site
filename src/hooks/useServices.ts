import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteService } from '@/lib/types';

interface UseServicesOptions {
  limit?: number;
  enabled?: boolean;
}

let channelCounter = 0;

export const useServices = (options?: UseServicesOptions) => {
  const enabled = options?.enabled ?? true;
  const [services, setServices] = useState<SiteService[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('s_services')
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

        setServices(data || []);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();

    const channel = supabase
      .channel(`s_services_${++channelCounter}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 's_services',
        },
        () => {
          fetchServices();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, options?.limit]);

  return { services, loading, error };
};