import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { WhatsAppSettings } from '@/lib/api-types';

/** WhatsApp button settings (Django admin → "WhatsApp"); null until loaded or if it fails. */
export const useWhatsAppSettings = () => {
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .get<WhatsAppSettings>('/whatsapp-settings/')
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch((err) => console.error('Error fetching WhatsApp settings:', err))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { settings, loading };
};
