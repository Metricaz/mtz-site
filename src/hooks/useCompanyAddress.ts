import { useApiList } from '@/hooks/useApiList';
import { CompanyAddress } from '@/lib/api-types';

/** First active address, by position (Django admin → "Endereços"): the one on the home page. */
export const useCompanyAddress = () => {
  const items = useApiList<CompanyAddress>('/addresses/', { limit: 1 });
  return { address: items[0] ?? null };
};

/** Every active address, by position: one tab each on the contact page. */
export const useCompanyAddresses = () => ({ addresses: useApiList<CompanyAddress>('/addresses/') });
