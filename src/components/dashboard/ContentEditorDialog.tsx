import { useEffect, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RichTextEditor } from '@/components/dashboard/RichTextEditor';
import { api, ApiError } from '@/lib/api';

/** What the dashboard can open in the editor: only content_html is saved from here (the rest stays in the admin). */
export interface EditableContent {
  id: number;
  title: string;
  content_html: string;
}

interface ContentEditorDialogProps<T extends EditableContent> {
  /** API collection, e.g. '/posts/'. */
  endpoint: string;
  item: T;
  onClose: () => void;
  onSaved: (item: T) => void;
}

const errorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.status === 403) return 'Sua sessão expirou ou você não tem permissão. Entre de novo.';
    const detail = (error.data as { content_html?: string[] } | null)?.content_html;
    if (detail?.length) return detail.join(' ');
  }
  return 'Não foi possível salvar. Tente de novo.';
};

export const ContentEditorDialog = <T extends EditableContent>({ endpoint, item, onClose, onSaved }: ContentEditorDialogProps<T>) => {
  const [html, setHtml] = useState(item.content_html);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const dirty = html !== item.content_html;

  const close = () => {
    if (dirty && !window.confirm('Descartar as alterações não salvas?')) return;
    onClose();
  };

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await api.patch<T>(`${endpoint}${item.id}/`, { content_html: html });
      onSaved(saved);
    } catch (err) {
      console.error('Error saving content:', err);
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink-deep/80 p-4 backdrop-blur-sm md:p-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-editor-title"
    >
      <div className="w-full max-w-5xl rounded-3xl border border-border/80 bg-card p-5 shadow-card md:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Editar conteúdo</p>
            <h2 id="content-editor-title" className="mt-2 font-display text-2xl font-semibold">
              {item.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Cole direto do Google Docs, Word ou de uma página: a formatação vira HTML simples. Título, imagem de capa e
              o resto continuam no admin.
            </p>
          </div>
          <Button type="button" variant="ghost" className="h-9 w-9 p-0" onClick={close} aria-label="Fechar">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <RichTextEditor value={html} onChange={setHtml} onError={setError} disabled={saving} />

        <div className="mt-5 flex flex-wrap items-center justify-end gap-3">
          {error && (
            <p className="mr-auto text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="button" variant="outline" onClick={close} disabled={saving}>
            Cancelar
          </Button>
          <Button type="button" onClick={save} disabled={saving || !dirty} className="gap-2">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
};
