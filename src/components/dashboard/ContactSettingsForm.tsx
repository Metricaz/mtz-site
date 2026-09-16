import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ContactSettingsFormProps {
  whatsappNumber: string;
  whatsappEnabled: boolean;
  whatsappMessage: string;
  onWhatsappNumberChange: (value: string) => void;
  onWhatsappEnabledChange: (value: boolean) => void;
  onWhatsappMessageChange: (value: string) => void;
  onSave: () => void;
  available?: boolean;
  saving?: boolean;
}

export const ContactSettingsForm = ({
  whatsappNumber,
  whatsappEnabled,
  whatsappMessage,
  onWhatsappNumberChange,
  onWhatsappEnabledChange,
  onWhatsappMessageChange,
  onSave,
  available = true,
  saving = false,
}: ContactSettingsFormProps) => {
  const normalizedNumber = whatsappNumber.replace(/\D/g, '');

  return (
    <Card className="border-border/80 bg-card/55 p-6 shadow-card md:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div>
          <p className="eyebrow">// Contato</p>
          <h3 className="editorial mt-4 text-4xl md:text-5xl">Configuração do WhatsApp</h3>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Defina o número que será usado no botão de WhatsApp do site e escolha se ele ficará visível para os visitantes.
          </p>

          <div className="mt-8 rounded-3xl border border-border bg-ink-deep/55 p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Prévia</p>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-foreground/90">{whatsappEnabled ? 'Botão ativo' : 'Botão desativado'}</p>
              <p className="text-sm text-muted-foreground">
                {normalizedNumber ? `Destino atual: ${normalizedNumber}` : 'Nenhum número configurado'}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6 rounded-3xl border border-border bg-background/40 p-6">
          {!available && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
              A tabela de configurações ainda não está ativa no Supabase. Aplique o trecho `s_site_settings`
              de `database.sql` para habilitar o salvamento do WhatsApp.
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="whatsapp-number">Número do WhatsApp</Label>
            <Input
              id="whatsapp-number"
              value={whatsappNumber}
              onChange={(event) => onWhatsappNumberChange(event.target.value)}
              placeholder="5511999999999"
              autoComplete="tel"
            />
            <p className="text-xs text-muted-foreground">Use apenas números com código do país, por exemplo 5511999999999.</p>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 p-4">
            <div>
              <Label htmlFor="whatsapp-enabled" className="text-sm font-medium">
          <div className="space-y-2">
            <Label htmlFor="whatsapp-message">Mensagem padrão</Label>
            <textarea
              id="whatsapp-message"
              value={whatsappMessage}
              onChange={(event) => onWhatsappMessageChange(event.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-border bg-card/60 px-4 py-3 text-sm outline-none transition-colors focus:border-primary/60"
              placeholder="Olá, vim pelo site da Metricaz e gostaria de conversar."
            />
            <p className="text-xs text-muted-foreground">
              Essa mensagem será pré-preenchida quando o visitante tocar no botão de WhatsApp.
            </p>
          </div>
                Ativar botão de WhatsApp
              </Label>
              <p className="mt-1 text-xs text-muted-foreground">Quando desativado, o botão não aparece no site.</p>
            </div>
            <Switch
              id="whatsapp-enabled"
              checked={whatsappEnabled}
              onCheckedChange={onWhatsappEnabledChange}
            />
          </div>

          <Button onClick={onSave} disabled={saving || !available} className="w-full h-11">
            {saving ? 'Salvando...' : available ? 'Salvar configurações' : 'Aguardando migração do banco'}
          </Button>
        </div>
      </div>
    </Card>
  );
};