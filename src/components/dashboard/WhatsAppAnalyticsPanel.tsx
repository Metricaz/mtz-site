import { Card } from '@/components/ui/card';
import { useWhatsAppAnalytics } from '@/hooks/useWhatsAppAnalytics';

export const WhatsAppAnalyticsPanel = () => {
  const { loading, available, summary } = useWhatsAppAnalytics();

  return (
    <Card className="border-border/80 bg-card/55 p-6 shadow-card md:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="eyebrow">// Relatório WhatsApp</p>
          <h3 className="editorial mt-4 text-4xl md:text-5xl">Cliques e horários</h3>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Resumo dos últimos 90 dias com recorte diário, semanal, mensal e os pontos de maior acionamento.
          </p>
        </div>
        {!available && (
          <p className="rounded-full border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-100">
            Tabela de cliques ainda não aplicada no banco.
          </p>
        )}
      </div>

      {loading ? (
        <div className="mt-8 text-sm text-muted-foreground">Carregando relatório...</div>
      ) : (
        <div className="mt-8 space-y-8">
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Hoje', value: summary.today },
              { label: 'Semana', value: summary.week },
              { label: 'Mês', value: summary.month },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border bg-background/40 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                <p className="mt-3 text-3xl font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ReportList title="Páginas mais acionadas" items={summary.topPages} />
            <ReportList title="Contextos mais acionados" items={summary.topContexts} />
            <ReportList title="Horários mais fortes" items={summary.topHours} />
          </div>
        </div>
      )}
    </Card>
  );
};

const ReportList = ({
  title,
  items,
}: {
  title: string;
  items: Array<{ label: string; count: number }>;
}) => (
  <div className="rounded-2xl border border-border bg-background/40 p-5">
    <p className="text-sm font-medium text-foreground">{title}</p>
    <div className="mt-4 space-y-3">
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">Sem dados suficientes.</p>
      ) : (
        items.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4 text-sm">
            <span className="truncate text-muted-foreground">{item.label}</span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
              {item.count}
            </span>
          </div>
        ))
      )}
    </div>
  </div>
);