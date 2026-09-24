import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { SiteImage } from '@/lib/api-types';

/** Single site image by key (Django admin → "Imagens do site"); null if missing, so nothing is shown. */
export const useSiteImage = (key: string) => {
  const [image, setImage] = useState<SiteImage | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<SiteImage>(`/site-images/${key}/`)
      .then((data) => {
        if (!cancelled) setImage(data);
      })
      .catch(() => {
        if (!cancelled) setImage(null);
      });
    return () => {
      cancelled = true;
    };
  }, [key]);

  return image;
};
