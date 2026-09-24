import { ReactNode, useMemo } from 'react';
import { useApiList } from '@/hooks/useApiList';
import { SiteOptionsContext } from '@/hooks/useSiteOptions';
import { SiteOption } from '@/lib/api-types';

/** Fetches /api/options/ once for the whole app; components read it with useSiteOptions(). */
export const SiteOptionsProvider = ({ children }: { children: ReactNode }) => {
  const { items, loading } = useApiList<SiteOption>('/options/');
  const value = useMemo(
    () => ({
      options: Object.fromEntries(items.map((o) => [o.key, o.value])) as Record<string, string>,
      labels: Object.fromEntries(items.map((o) => [o.key, o.label])) as Record<string, string>,
      loading,
    }),
    [items, loading],
  );
  return <SiteOptionsContext.Provider value={value}>{children}</SiteOptionsContext.Provider>;
};
