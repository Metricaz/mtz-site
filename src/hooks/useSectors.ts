import { useApiList } from '@/hooks/useApiList';
import { Sector } from '@/lib/api-types';

export const useSectors = () => {
  const sectors = useApiList<Sector>('/sectors/');
  return { sectors };
};
