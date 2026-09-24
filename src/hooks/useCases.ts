import { useApiList } from '@/hooks/useApiList';
import { Case } from '@/lib/api-types';

interface UseCasesOptions {
  limit?: number;
  slug?: string;
  enabled?: boolean;
}

export const useCases = (options?: UseCasesOptions) => {
  const { items: cases, loading, error } = useApiList<Case>(
    '/cases/',
    { limit: options?.limit, slug: options?.slug },
    options?.enabled ?? true,
  );
  return { cases, loading, error };
};
