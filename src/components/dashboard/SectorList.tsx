import { Sector } from '@/lib/api-types';
import { Card } from '@/components/ui/card';
import { ItemBadges } from '@/components/dashboard/ItemBadges';

interface SectorListProps {
  sectors: Sector[];
}

export const SectorList = ({ sectors }: SectorListProps) => {
  if (sectors.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum setor cadastrado ainda</p>
        <p className="text-sm text-muted-foreground mt-2">Cadastre pelo admin do Django</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {sectors.map((sector) => (
        <Card key={sector.id} className="p-4">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-lg">{sector.name}</h3>
              <ItemBadges isActive={sector.is_active} />
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Posição: {sector.order_position}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Criado em: {new Date(sector.created_at).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </Card>
      ))}
    </div>
  );
};
