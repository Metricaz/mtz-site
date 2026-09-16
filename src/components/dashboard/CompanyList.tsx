import { Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Edit2, Trash2 } from 'lucide-react';

interface CompanyListProps {
  companies: Company[];
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
}

export const CompanyList = ({ companies, onEdit, onDelete }: CompanyListProps) => {
  if (companies.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhuma empresa cadastrada ainda</p>
        <p className="text-sm text-muted-foreground mt-2">Clique em "Adicionar Empresa" para começar</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {companies.map((company) => (
        <Card key={company.id} className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1">
              {/* Logo */}
              <div className="flex-shrink-0">
                {company.website_url ? (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noreferrer"
                    className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden"
                    aria-label={`Abrir site de ${company.name}`}
                  >
                    <img
                      src={company.logo_url}
                      alt={company.logo_alt || company.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </a>
                ) : (
                  <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                    <img
                      src={company.logo_url}
                      alt={company.logo_alt || company.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg">{company.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Posição: {company.order_position}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Criado em: {new Date(company.created_at).toLocaleDateString('pt-BR')}
                </p>
                {company.website_url && (
                  <p className="text-xs text-muted-foreground mt-1 break-all">
                    Site: {company.website_url}
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(company)}
                className="gap-1"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => onDelete(company.id)}
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
