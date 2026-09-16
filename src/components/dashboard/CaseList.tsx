import { SiteCase } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';

interface CaseListProps {
  cases: SiteCase[];
  onEdit: (caseItem: SiteCase) => void;
  onDelete: (id: string) => void;
}

export const CaseList = ({ cases, onEdit, onDelete }: CaseListProps) => {
  if (cases.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum case cadastrado ainda</p>
        <p className="mt-2 text-sm text-muted-foreground">Clique em "Adicionar Case" para começar</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {cases.map((caseItem) => (
        <Card key={caseItem.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-1 items-start gap-4">
              <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded bg-muted">
                <img
                  src={caseItem.featured_image_url}
                  alt={caseItem.featured_image_alt || caseItem.title}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {caseItem.tag}
                  </span>
                  <span className="text-xs text-muted-foreground">/{caseItem.slug}</span>
                </div>
                <h3 className="text-lg font-semibold">{caseItem.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{caseItem.excerpt}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  KPI: {caseItem.kpi_value} · {caseItem.kpi_label}
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 gap-2">
              <Button size="sm" variant="outline" className="gap-1" onClick={() => onEdit(caseItem)}>
                <Edit2 className="h-4 w-4" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(caseItem.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
