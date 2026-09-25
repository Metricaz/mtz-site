import { useApiGet } from '@/hooks/useApiList';
import { WhatsAppSettings } from '@/lib/api-types';

/** WhatsApp button settings (Django admin → "WhatsApp"); null until loaded or if it fails. */
export const useWhatsAppSettings = () => {
  const { data: settings, loading } = useApiGet<WhatsAppSettings>('/whatsapp-settings/');
  return { settings, loading };
};
