import { useApiGet } from '@/hooks/useApiList';
import { SiteImage } from '@/lib/api-types';

/** Single site image by key (Django admin → "Imagens do site"); null if missing, so nothing is shown. */
export const useSiteImage = (key: string) => useApiGet<SiteImage>(`/site-images/${key}/`);
