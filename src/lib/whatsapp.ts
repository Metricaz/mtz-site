import { api } from '@/lib/api';

export const normalizeWhatsAppNumber = (value: string) => value.replace(/\D/g, '');

// The message comes only from the database (Django admin → WhatsApp); empty = the chat opens with no text.
export const getWhatsAppMessage = (message?: string | null) => message?.trim() || '';

export const buildWhatsAppHref = (number: string, message?: string | null) => {
  const cleanedNumber = normalizeWhatsAppNumber(number);
  const finalMessage = getWhatsAppMessage(message);

  if (!cleanedNumber) {
    return '';
  }

  const base = `https://wa.me/${cleanedNumber}`;
  return finalMessage ? `${base}?text=${encodeURIComponent(finalMessage)}` : base;
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
    await api.post('/whatsapp-clicks/', {
      page_path: pagePath,
      button_context: buttonContext,
      target_number: normalizeWhatsAppNumber(number),
      message_text: getWhatsAppMessage(message),
    });
  } catch (error) {
    console.error('Error tracking WhatsApp click:', error);
  }
};