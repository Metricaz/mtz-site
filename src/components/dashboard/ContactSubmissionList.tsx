import { Card } from '@/components/ui/card';
import { ContactSubmission } from '@/lib/types';

interface ContactSubmissionListProps {
  submissions: ContactSubmission[];
}

const statusLabel: Record<ContactSubmission['status'], string> = {
  queued: 'Pendente',
  sent: 'Enviado',
  failed: 'Falhou',
};

const statusClass: Record<ContactSubmission['status'], string> = {
  queued: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  sent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
  failed: 'border-rose-500/30 bg-rose-500/10 text-rose-100',
};

export const ContactSubmissionList = ({ submissions }: ContactSubmissionListProps) => {
  if (submissions.length === 0) {
    return (
      <Card className="border-border/80 bg-card/55 p-8 text-center shadow-card">
        <p className="text-base font-medium">Nenhuma mensagem recebida ainda</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Quando alguém preencher o formulário da home, do Quem Somos ou da página de contato, o registro vai aparecer aqui.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="border-border/80 bg-card/55 p-5 shadow-card">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-lg font-semibold text-foreground">{submission.name}</h4>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass[submission.status]}`}>
                    {statusLabel[submission.status]}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {submission.email}{submission.company ? ` · ${submission.company}` : ''}
                </p>
              </div>

              <p className="max-w-3xl whitespace-pre-wrap text-sm leading-7 text-foreground/90">
                {submission.message}
              </p>
            </div>

            <div className="grid gap-2 rounded-2xl border border-border bg-background/40 p-4 text-xs text-muted-foreground lg:min-w-[260px]">
              <InfoRow label="Página" value={submission.source_page || '-'} />
              <InfoRow label="Origem" value={submission.source_context || '-'} />
              <InfoRow label="Telefone" value={submission.phone || '-'} />
              <InfoRow label="Recebido em" value={formatDateTime(submission.created_at)} />
              {submission.error_message && <InfoRow label="Erro" value={submission.error_message} />}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-start justify-between gap-3">
    <span className="shrink-0 font-medium text-foreground/85">{label}</span>
    <span className="text-right text-muted-foreground">{value}</span>
  </div>
);

const formatDateTime = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
};