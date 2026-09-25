import { useApiList } from '@/hooks/useApiList';
import { CompanyAddress } from '@/lib/api-types';

/** The site shows only the first active address, by position (Django admin → "Endereços"). */
export const useCompanyAddress = () => {
  const items = useApiList<CompanyAddress>('/addresses/', { limit: 1 });
  return { address: items[0] ?? null };
};
