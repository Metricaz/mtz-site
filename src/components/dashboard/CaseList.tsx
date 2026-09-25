import { Case } from '@/lib/api-types';
import { Card } from '@/components/ui/card';
import { ItemBadges } from '@/components/dashboard/ItemBadges';

interface CaseListProps {
  cases: Case[];
}

export const CaseList = ({ cases }: CaseListProps) => {
  if (cases.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum case cadastrado ainda</p>
        <p className="mt-2 text-sm text-muted-foreground">Cadastre pelo admin do Django</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {cases.map((caseItem) => (
        <Card key={caseItem.id} className="p-4">
          <div className="flex flex-1 items-start gap-4">
            <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded bg-muted">
              <img
                src={caseItem.featured_image}
                alt={caseItem.featured_image_alt || caseItem.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {caseItem.tag}
                </span>
                <span className="text-xs text-muted-foreground">/{caseItem.slug}</span>
                <ItemBadges isActive={caseItem.is_active} />
              </div>
              <h3 className="text-lg font-semibold">{caseItem.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{caseItem.excerpt}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                KPI: {caseItem.kpi_value} · {caseItem.kpi_label}
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
