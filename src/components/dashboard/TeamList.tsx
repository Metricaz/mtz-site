import { TeamMember } from '@/lib/api-types';
import { Card } from '@/components/ui/card';
import { ItemBadges } from '@/components/dashboard/ItemBadges';

interface TeamListProps {
  team: TeamMember[];
}

const places = (member: TeamMember) =>
  [member.show_on_home && 'Home', member.show_on_about && 'Quem Somos'].filter(Boolean) as string[];

export const TeamList = ({ team }: TeamListProps) => {
  if (team.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum membro de time cadastrado ainda</p>
        <p className="text-sm text-muted-foreground mt-2">Cadastre pelo admin do Django</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {team.map((member) => (
        <Card key={member.id} className="p-4">
          <div className="flex items-start gap-4">
            {/* Foto */}
            <div className="flex-shrink-0">
              <div className="w-16 h-20 bg-muted rounded flex items-center justify-center overflow-hidden">
                {member.photo ? (
                  <img src={member.photo} alt={member.photo_alt || member.name} className="max-w-full max-h-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">sem foto</span>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-lg">{member.name}</h3>
                <ItemBadges isActive={member.is_active} places={places(member)} />
              </div>
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
        </Card>
      ))}
    </div>
  );
};
