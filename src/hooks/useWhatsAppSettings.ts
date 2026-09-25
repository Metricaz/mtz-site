import { useApiGet } from '@/hooks/useApiList';
import { WhatsAppSettings } from '@/lib/api-types';

/** WhatsApp button settings (Django admin → "WhatsApp"); null if it fails. */
export const useWhatsAppSettings = () => ({ settings: useApiGet<WhatsAppSettings>('/whatsapp-settings/') });
