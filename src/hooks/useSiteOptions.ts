import { useMemo } from 'react';
import { useApiList } from '@/hooks/useApiList';
import { SiteOption } from '@/lib/api-types';

/**
 * Loose site values by key (Django admin → "Opções do site").
 * A key without a value is simply absent, so `options['x']` is undefined and nothing is shown.
 */
export const useSiteOptions = () => {
  const { items, loading } = useApiList<SiteOption>('/options/');
  const options = useMemo(() => Object.fromEntries(items.map((o) => [o.key, o.value])) as Record<string, string>, [items]);
  return { options, loading };
};
