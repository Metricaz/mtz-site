import { useEffect, useState } from 'react';
import { api, Query } from '@/lib/api';

/**
 * GET a list from the Django API. While loading `items` is empty; on error it stays empty
 * (sections render nothing without data — there is no fallback content).
 */
export const useApiList = <T>(path: string, query?: Query, enabled = true) => {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const queryKey = JSON.stringify(query || {});

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    api
      .get<T[]>(path, JSON.parse(queryKey))
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch((err) => {
        console.error(`Error fetching ${path}:`, err);
        if (!cancelled) {
          setItems([]);
          setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [path, queryKey, enabled]);

  return { items, loading, error };
};
