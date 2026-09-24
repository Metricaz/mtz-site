import { useApiList } from '@/hooks/useApiList';
import { TeamMember, TeamPlacement } from '@/lib/api-types';

interface UseTeamOptions {
  placement: TeamPlacement;
  enabled?: boolean;
}

/**
 * Hook para buscar membros do time marcados para um lugar do site
 * ("home" = seção Time da home, "about" = Heads da operação no Quem Somos)
 */
export const useTeam = ({ placement, enabled = true }: UseTeamOptions) => {
  const { items: team, loading, error } = useApiList<TeamMember>('/team/', { placement }, enabled);
  return { team, loading, error };
};
