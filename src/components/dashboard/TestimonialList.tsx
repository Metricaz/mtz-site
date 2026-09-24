import { Testimonial } from '@/lib/api-types';
import { Card } from '@/components/ui/card';
import { ItemBadges } from '@/components/dashboard/ItemBadges';

interface TestimonialListProps {
  testimonials: Testimonial[];
}

const places = (testimonial: Testimonial) =>
  [
    testimonial.show_in_client_panel && '//cliente',
    testimonial.show_in_testimonials && '//depoimentos',
    testimonial.show_on_about && 'Quem Somos',
  ].filter(Boolean) as string[];

export const TestimonialList = ({ testimonials }: TestimonialListProps) => {
  if (testimonials.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum depoimento cadastrado ainda</p>
        <p className="text-sm text-muted-foreground mt-2">Cadastre pelo admin do Django</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="p-6">
          <div className="flex-1 min-w-0">
            {/* Header com nome e onde aparece */}
            <div className="flex items-center gap-3 mb-3">
              <div>
                <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role} · {testimonial.company}
                </p>
              </div>
              <div className="ml-auto flex-shrink-0">
                <ItemBadges isActive={testimonial.is_active} places={places(testimonial)} />
              </div>
            </div>

            {/* Depoimento */}
            <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
              "{testimonial.text}"
            </p>

            {/* Meta info */}
            <p className="text-xs text-muted-foreground">
              Posição: {testimonial.order_position}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};
