import { Company } from '@/lib/api-types';
import { Card } from '@/components/ui/card';
import { ItemBadges } from '@/components/dashboard/ItemBadges';

interface CompanyListProps {
  companies: Company[];
}

const Logo = ({ company }: { company: Company }) =>
  company.logo ? (
    <img src={company.logo} alt={company.logo_alt || company.name} className="max-w-full max-h-full object-contain" />
  ) : (
    <span className="text-xs text-muted-foreground">sem logo</span>
  );

export const CompanyList = ({ companies }: CompanyListProps) => {
  if (companies.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhuma empresa cadastrada ainda</p>
        <p className="text-sm text-muted-foreground mt-2">Cadastre pelo admin do Django</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {companies.map((company) => (
        <Card key={company.id} className="p-4">
          <div className="flex items-start gap-4">
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
                  <Logo company={company} />
                </a>
              ) : (
                <div className="w-16 h-16 bg-muted rounded flex items-center justify-center overflow-hidden">
                  <Logo company={company} />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-lg">{company.name}</h3>
                <ItemBadges isActive={company.is_active} />
              </div>
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
        </Card>
      ))}
    </div>
  );
};
