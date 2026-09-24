import { useApiList } from '@/hooks/useApiList';
import { Testimonial, TestimonialPlacement } from '@/lib/api-types';

interface UseTestimonialsOptions {
  placement: TestimonialPlacement;
  enabled?: boolean;
}

/**
 * Hook para buscar depoimentos marcados para um lugar do site
 * ("client_panel" = painel Cliente, "testimonials" = seção Depoimentos, "about" = destaque do Quem Somos)
 */
export const useTestimonials = ({ placement, enabled = true }: UseTestimonialsOptions) => {
  const { items: testimonials, loading, error } = useApiList<Testimonial>('/testimonials/', { placement }, enabled);
  return { testimonials, loading, error };
};
