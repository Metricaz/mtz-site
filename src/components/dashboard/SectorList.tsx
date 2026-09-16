import { Sector } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';

interface SectorListProps {
  sectors: Sector[];
  onEdit: (sector: Sector) => void;
  onDelete: (id: string) => void;
}

export const SectorList = ({ sectors, onEdit, onDelete }: SectorListProps) => {
  if (sectors.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum setor cadastrado ainda</p>
        <p className="text-sm text-muted-foreground mt-2">Clique em "Adicionar Setor" para começar</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {sectors.map((sector) => (
        <Card key={sector.id} className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{sector.name}</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Posição: {sector.order_position}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Criado em: {new Date(sector.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(sector)}
                className="gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(sector.id)}
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