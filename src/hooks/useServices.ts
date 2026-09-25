import { useApiList } from '@/hooks/useApiList';
import { Service } from '@/lib/api-types';

interface UseServicesOptions {
  limit?: number;
  slug?: string;
  enabled?: boolean;
}

export const useServices = (options?: UseServicesOptions) => {
  const services = useApiList<Service>(
    '/services/',
    { limit: options?.limit, slug: options?.slug },
    options?.enabled ?? true,
  );
  return { services };
};
