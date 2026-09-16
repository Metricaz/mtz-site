import { supabase } from '@/lib/supabase';
import { isMissingSupabaseTableError } from '@/lib/supabase-errors';

const defaultWhatsAppMessage = 'Olá, vim pelo site da Metricaz e gostaria de conversar.';

export const normalizeWhatsAppNumber = (value: string) => value.replace(/\D/g, '');

export const getWhatsAppMessage = (message?: string | null) => {
  const trimmedMessage = message?.trim();
  return trimmedMessage || defaultWhatsAppMessage;
};

export const buildWhatsAppHref = (number: string, message?: string | null) => {
  const cleanedNumber = normalizeWhatsAppNumber(number);
  const finalMessage = getWhatsAppMessage(message);

  if (!cleanedNumber) {
    return '';
  }

  return `https://wa.me/${cleanedNumber}?text=${encodeURIComponent(finalMessage)}`;
};

export const trackWhatsAppClick = async ({
  number,
  message,
  pagePath,
  buttonContext,
}: {
  number: string;
  message?: string | null;
  pagePath: string;
  buttonContext: string;
}) => {
  try {
    const { error } = await supabase.from('s_whatsapp_clicks').insert({
      page_path: pagePath,
      button_context: buttonContext,
      target_number: normalizeWhatsAppNumber(number),
      message_text: getWhatsAppMessage(message),
      clicked_at: new Date().toISOString(),
    });

    if (error && !isMissingSupabaseTableError(error)) {
      throw error;
    }
  } catch (error) {
    if (!isMissingSupabaseTableError(error)) {
      console.error('Error tracking WhatsApp click:', error);
    }
  }
};