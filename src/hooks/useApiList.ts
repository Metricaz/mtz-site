import { useQuery } from '@tanstack/react-query';
import { api, Query } from '@/lib/api';

/**
 * GET from the Django API through the react-query cache (key = path + query), so the same
 * request is shared by every component that asks for it.
 */
export const useApiGet = <T>(path: string, query?: Query, enabled = true) => {
  const { data, isLoading, error } = useQuery({
    queryKey: [path, query ?? {}],
    queryFn: () => api.get<T>(path, query),
    enabled,
  });

  return {
    data: data ?? null,
    loading: isLoading,
    error: error ? error.message || 'Erro ao carregar dados' : null,
  };
};

/**
 * GET a list from the Django API. While loading `items` is empty; on error it stays empty
 * (sections render nothing without data — there is no fallback content).
 */
export const useApiList = <T>(path: string, query?: Query, enabled = true) => {
  const { data, loading, error } = useApiGet<T[]>(path, query, enabled);
  return { items: data ?? [], loading, error };
};
