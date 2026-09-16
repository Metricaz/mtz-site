import { Testimonial } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';

interface TestimonialListProps {
  testimonials: Testimonial[];
  onEdit: (testimonial: Testimonial) => void;
  onDelete: (id: string) => void;
}

export const TestimonialList = ({ testimonials, onEdit, onDelete }: TestimonialListProps) => {
  if (testimonials.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum depoimento cadastrado ainda</p>
        <p className="text-sm text-muted-foreground mt-2">Clique em "Adicionar Depoimento" para começar</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {testimonials.map((testimonial) => (
        <Card key={testimonial.id} className="p-6">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              {/* Header com nome e seção */}
              <div className="flex items-center gap-3 mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
                <div className="ml-auto flex-shrink-0">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {testimonial.section === 'clients' ? '//clientes' : '//Depoimentos'}
                  </span>
                </div>
              </div>

              {/* Depoimento */}
              <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                "{testimonial.testimonial}"
              </p>

              {/* Meta info */}
              <p className="text-xs text-muted-foreground">
                Posição: {testimonial.order_position}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(testimonial)}
                className="gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(testimonial.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
