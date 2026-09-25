import { useApiList } from '@/hooks/useApiList';
import { Company } from '@/lib/api-types';

/**
 * Hook para buscar empresas clientes
 * Usado na seção "Quem Confia"
 */
export const useCompanies = () => {
  const companies = useApiList<Company>('/companies/');
  return { companies };
};
