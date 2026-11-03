import { useApiList } from '@/hooks/useApiList';
import { FaqItem } from '@/lib/api-types';

/** Active FAQ items, by position: the home's (no service) or one service's (its slug). */
export const useFaq = (service: 'home' | (string & {})) => {
  const items = useApiList<FaqItem>('/faq/', { service });
  return { items };
};
