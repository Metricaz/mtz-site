import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Testimonial } from '@/lib/types';

interface UseTestimonialsOptions {
  section?: 'clients' | 'testimonials';
  enabled?: boolean;
}

// Counter para gerar nomes únicos de canal
let channelCounter = 0;

/**
 * Hook para buscar depoimentos
 * Pode filtrar por seção (clients ou testimonials)
 */
export const useTestimonials = (options?: UseTestimonialsOptions) => {
  const enabled = options?.enabled ?? true;
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from('s_testimonials')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true });

        // Filtrar por seção se especificado
        if (options?.section) {
          query = query.eq('section', options.section);
        }

        const { data, error: supabaseError } = await query;

        if (supabaseError) {
          throw supabaseError;
        }

        setTestimonials(data || []);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar depoimentos');
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();

    // Subscribe to real-time changes com nome de canal único
    const uniqueChannelName = `s_testimonials_${options?.section || 'all'}_${++channelCounter}`;
    const channel = supabase
      .channel(uniqueChannelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 's_testimonials',
        },
        (payload) => {
          console.log('Real-time testimonials update:', payload);
          // Refetch testimonials when there's a change
          fetchTestimonials();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, options?.section]);

  return { testimonials, loading, error };
};
