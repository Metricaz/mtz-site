import { SiteService } from '@/lib/types';
import { getServiceIcon } from '@/lib/service-icons';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';

interface ServiceListProps {
  services: SiteService[];
  onEdit: (service: SiteService) => void;
  onDelete: (id: string) => void;
}

export const ServiceList = ({ services, onEdit, onDelete }: ServiceListProps) => {
  if (services.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum serviço cadastrado ainda</p>
        <p className="mt-2 text-sm text-muted-foreground">Clique em "Adicionar Serviço" para começar</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {services.map((service) => {
        const Icon = getServiceIcon(service.icon_name);

        return (
          <Card key={service.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-1 items-start gap-4">
                <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl border border-border bg-primary/10 text-primary">
                  <Icon className="h-8 w-8" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {service.title}
                    </span>
                    <span className="text-xs text-muted-foreground">/{service.slug}</span>
                    <span className="text-xs text-muted-foreground">{service.icon_name}</span>
                  </div>
                  <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{service.excerpt}</p>
                </div>
              </div>

              <div className="flex flex-shrink-0 gap-2">
                <Button size="sm" variant="outline" className="gap-1" onClick={() => onEdit(service)}>
                  <Edit2 className="h-4 w-4" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  onClick={() => onDelete(service.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};