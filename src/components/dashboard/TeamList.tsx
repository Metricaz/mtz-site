import { TeamMember } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';

interface TeamListProps {
  team: TeamMember[];
  onEdit: (member: TeamMember) => void;
  onDelete: (id: string) => void;
}

export const TeamList = ({ team, onEdit, onDelete }: TeamListProps) => {
  if (team.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum membro de time cadastrado ainda</p>
        <p className="text-sm text-muted-foreground mt-2">Clique em "Adicionar Membro" para começar</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {team.map((member) => (
        <Card key={member.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Foto */}
              <div className="flex-shrink-0">
                <div className="w-16 h-20 bg-muted rounded flex items-center justify-center overflow-hidden">
                  <img
                    src={member.image_url}
                    alt={member.image_alt || member.name}
                    className="max-w-full max-h-full object-cover"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <p className="text-sm text-primary font-medium">{member.role}</p>
                {member.bio && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {member.bio}
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Posição: {member.order_position}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(member)}
                className="gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(member.id)}
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
