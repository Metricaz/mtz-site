import { Card } from '@/components/ui/card';
import { WhatsAppSettings } from '@/lib/api-types';

interface WhatsAppSettingsCardProps {
  settings: WhatsAppSettings | null;
}

/** Read-only view of the WhatsApp button settings (edited in the Django admin). */
export const WhatsAppSettingsCard = ({ settings }: WhatsAppSettingsCardProps) => {
  const normalizedNumber = (settings?.number || '').replace(/\D/g, '');

  return (
    <Card className="border-border/80 bg-card/55 p-6 shadow-card md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="eyebrow">// Contato</p>
          <h3 className="editorial mt-4 text-4xl md:text-5xl">Configuração do WhatsApp</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Número, status e mensagem do botão de WhatsApp do site. Para alterar, use o admin do Django.
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-ink-deep/55 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Prévia</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-foreground/90">{settings?.enabled ? 'Botão ativo' : 'Botão desativado'}</p>
              <p className="text-sm text-muted-foreground">
                {normalizedNumber ? `Destino atual: ${normalizedNumber}` : 'Nenhum número configurado'}
              </p>
            </div>
          </div>
        </div>

        <dl className="space-y-6 rounded-3xl border border-border bg-background/40 p-6">
          <div className="space-y-2">
            <dt className="text-sm font-medium">Número do WhatsApp</dt>
            <dd className="text-sm text-muted-foreground">{normalizedNumber || '—'}</dd>
          </div>
          <div className="space-y-2">
            <dt className="text-sm font-medium">Botão</dt>
            <dd className="text-sm text-muted-foreground">{settings?.enabled ? 'Ativo' : 'Desativado'}</dd>
          </div>
          <div className="space-y-2">
            <dt className="text-sm font-medium">Mensagem inicial</dt>
            <dd className="whitespace-pre-wrap text-sm text-muted-foreground">{settings?.message || '—'}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
};
