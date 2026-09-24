import { useApiList } from '@/hooks/useApiList';
import { Sector } from '@/lib/api-types';

export const useSectors = () => {
  const { items: sectors, loading, error } = useApiList<Sector>('/sectors/');
  return { sectors, loading, error };
};
