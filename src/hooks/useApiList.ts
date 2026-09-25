import { useSuspenseQuery } from '@tanstack/react-query';
import { api, Query } from '@/lib/api';

/** react-query key of a GET (the server reads the rendered data back by it). */
export const apiQueryKey = (path: string, query?: Query, enabled = true) => [path, query ?? {}, enabled];

/**
 * GET from the Django API through the react-query cache. It suspends until the data is there, so
 * the server renders the page with its content (and the browser reuses that data when hydrating).
 * A failed or disabled request gives null: the section renders nothing (there is no fallback content).
 */
export const useApiGet = <T>(path: string, query?: Query, enabled = true): T | null =>
  useSuspenseQuery({
    queryKey: apiQueryKey(path, query, enabled),
    queryFn: async () => {
      if (!enabled) return null;
      try {
        return await api.get<T>(path, query);
      } catch (err) {
        console.error(`Error fetching ${path}:`, err);
        return null;
      }
    },
  }).data;

/** GET a list from the Django API; empty on error. */
export const useApiList = <T>(path: string, query?: Query, enabled = true): T[] =>
  useApiGet<T[]>(path, query, enabled) ?? [];
