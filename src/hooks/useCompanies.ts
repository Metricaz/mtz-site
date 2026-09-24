import { useApiList } from '@/hooks/useApiList';
import { Company } from '@/lib/api-types';

/**
 * Hook para buscar empresas clientes
 * Usado na seção "Quem Confia"
 */
export const useCompanies = () => {
  const { items: companies, loading, error } = useApiList<Company>('/companies/');
  return { companies, loading, error };
};
