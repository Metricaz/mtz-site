import { Service } from '@/lib/api-types';
import { getServiceIcon } from '@/lib/service-icons';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ItemBadges } from '@/components/dashboard/ItemBadges';

interface ServiceListProps {
  services: Service[];
  onEdit: (service: Service) => void;
}

export const ServiceList = ({ services, onEdit }: ServiceListProps) => {
  if (services.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum serviço cadastrado ainda</p>
        <p className="mt-2 text-sm text-muted-foreground">Cadastre pelo admin do Django</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {services.map((service) => {
        const Icon = getServiceIcon(service.icon_name);

        return (
          <Card key={service.id} className="p-4">
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
                  <ItemBadges isActive={service.is_active} />
                </div>
                <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{service.excerpt}</p>
              </div>
            <Button type="button" variant="outline" size="sm" className="flex-shrink-0 gap-2" onClick={() => onEdit(service)}>
              <Pencil className="h-4 w-4" />
              Editar conteúdo
            </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
