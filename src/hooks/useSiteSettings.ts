import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteSettings } from '@/lib/types';
import { isMissingSupabaseTableError } from '@/lib/supabase-errors';

const defaultSettings: SiteSettings = {
  id: 1,
  whatsapp_number: '',
  whatsapp_enabled: true,
  whatsapp_message: 'Olá, vim pelo site da Metricaz e gostaria de conversar.',
  created_at: '',
  updated_at: '',
};

interface UseSiteSettingsOptions {
  enabled?: boolean;
}

export const useSiteSettings = (options?: UseSiteSettingsOptions) => {
  const enabled = options?.enabled ?? true;
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: supabaseError } = await supabase
          .from('s_site_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle();

        if (supabaseError) {
          if (isMissingSupabaseTableError(supabaseError)) {
            setAvailable(false);
            setSettings(defaultSettings);
            setError(null);
            return;
          }

          throw supabaseError;
        }

        setAvailable(true);
        setSettings(data || defaultSettings);
      } catch (err) {
        console.error('Error fetching site settings:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar configurações');
        setSettings(defaultSettings);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [enabled]);

  return { settings, loading, error, available };
};