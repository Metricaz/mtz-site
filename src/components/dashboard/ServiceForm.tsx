import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteService } from '@/lib/types';
import { DEFAULT_SERVICE_CONTENT, SERVICE_ICON_OPTIONS, getServiceIcon, getServiceIconLabel } from '@/lib/service-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, Loader2, X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceFormProps {
  service?: SiteService | null;
  userId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const SERVICES_BUCKET = 'cases-media';

const toSlug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

const sanitizeFileName = (name: string) =>
  name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

export const ServiceForm = ({ service, userId, onClose, onSuccess }: ServiceFormProps) => {
  const [title, setTitle] = useState(service?.title || '');
  const [slug, setSlug] = useState(service?.slug || '');
  const [iconName, setIconName] = useState(service?.icon_name || 'seo');
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [excerpt, setExcerpt] = useState(service?.excerpt || '');
  const [contentHtml, setContentHtml] = useState(service?.content_html || DEFAULT_SERVICE_CONTENT);
  const [loading, setLoading] = useState(false);
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
  const [error, setError] = useState('');
  const SelectedIcon = getServiceIcon(iconName);

  const slugPreview = useMemo(() => (slug ? `/servicos/${slug}` : '/servicos/seu-slug'), [slug]);

  const handleGenerateSlug = () => {
    setSlug(toSlug(title));
  };

  const uploadImageToSupabase = async (file: File, folder: string) => {
    const safeSlug = toSlug(slug || title) || 'servico';
    const filePath = `${folder}/${safeSlug}/${Date.now()}-${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(SERVICES_BUCKET)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error(`Falha no upload para Supabase Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from(SERVICES_BUCKET).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const handleInlineImageUpload = async (file: File) => {
    setError('');
    setUploadingInlineImage(true);

    try {
      return await uploadImageToSupabase(file, 'content');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao subir imagem do editor.';
      setError(message);
      throw err;
    } finally {
      setUploadingInlineImage(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const normalizedSlug = toSlug(slug);

      if (!title.trim() || !normalizedSlug || !iconName.trim() || !excerpt.trim() || !contentHtml.trim()) {
        throw new Error('Preencha todos os campos obrigatorios.');
      }

      if (service) {
        const { error: updateError } = await supabase
          .from('s_services')
          .update({
            title: title.trim(),
            slug: normalizedSlug,
            icon_name: iconName.trim(),
            excerpt: excerpt.trim(),
            content_html: contentHtml.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', service.id);

        if (updateError) throw updateError;
      } else {
        if (!userId) throw new Error('User ID nao encontrado.');

        const { error: insertError } = await supabase
          .from('s_services')
          .insert([
            {
              title: title.trim(),
              slug: normalizedSlug,
              icon_name: iconName.trim(),
              excerpt: excerpt.trim(),
              content_html: contentHtml.trim(),
              order_position: 0,
              is_active: true,
              created_by: userId,
            },
          ]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar serviço.';
      if (message.toLowerCase().includes('duplicate key') || message.toLowerCase().includes('unique')) {
        setError('Este slug ja existe. Escolha outro slug.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/70 p-3 md:p-4">
      <Card className="grid h-[calc(100vh-1.5rem)] w-full max-w-[1600px] grid-rows-[auto_1fr_auto] overflow-hidden border-border/80 bg-card/95 p-4 shadow-card md:h-[calc(100vh-2rem)] md:p-6">
        <header className="mb-3 flex items-center justify-between rounded-2xl border border-border/70 bg-card/55 px-4 py-3">
          <div>
            <h2 className="text-2xl font-bold">{service ? 'Editar Serviço' : 'Adicionar Serviço'}</h2>
            <p className="text-xs text-muted-foreground">Estruture a página pública e os cards da área de serviços.</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground" type="button">
            <X className="h-5 w-5" />
          </button>
        </header>

        <form onSubmit={handleSubmit} className="grid min-h-0 grid-rows-[1fr_auto] gap-4">
          <div className="grid min-h-0 gap-4 xl:grid-cols-12">
            <section className="space-y-3 rounded-2xl border border-border/70 bg-card/35 p-4 xl:col-span-3">
              <div>
                <label htmlFor="title" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Titulo *
                </label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Ex: SEO"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="slug" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Slug *
                </label>
                <div className="grid gap-2 grid-cols-[1fr_auto]">
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="seo"
                    disabled={loading}
                    required
                  />
                  <Button type="button" variant="outline" onClick={handleGenerateSlug} disabled={loading || !title.trim()}>
                    Gerar
                  </Button>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">URL: {slugPreview}</p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Icone *
                </label>
                <Popover open={iconPickerOpen} onOpenChange={setIconPickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      role="combobox"
                      aria-expanded={iconPickerOpen}
                      disabled={loading}
                      className="mb-2 flex h-auto w-full items-center justify-between gap-3 border-border/70 bg-background/60 px-3 py-3 text-left font-normal"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <SelectedIcon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0 text-left">
                          <span className="block text-sm font-medium text-foreground">{getServiceIconLabel(iconName)}</span>
                          <span className="block truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{iconName}</span>
                        </span>
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[340px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Buscar ícone..." />
                      <CommandList>
                        <CommandEmpty>Nenhum ícone encontrado.</CommandEmpty>
                        <CommandGroup>
                          {SERVICE_ICON_OPTIONS.map((option) => {
                            const OptionIcon = option.icon;
                            const isActive = iconName === option.value;

                            return (
                              <CommandItem
                                key={option.value}
                                value={`${option.label} ${option.value}`}
                                onSelect={() => {
                                  setIconName(option.value);
                                  setIconPickerOpen(false);
                                }}
                              >
                                <span className="mr-3 flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                                  <OptionIcon className="h-4.5 w-4.5" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block text-sm font-medium">{option.label}</span>
                                  <span className="block truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{option.value}</span>
                                </span>
                                <Check className={cn('ml-2 h-4 w-4', isActive ? 'opacity-100' : 'opacity-0')} />
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <SelectedIcon className="h-4 w-4 text-primary" />
                  Atual: {getServiceIconLabel(iconName)}
                </div>
              </div>

              <div>
                <label htmlFor="excerpt" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Resumo curto *
                </label>
                <Textarea
                  id="excerpt"
                  value={excerpt}
                  onChange={(event) => setExcerpt(event.target.value)}
                  rows={5}
                  disabled={loading}
                  required
                />
              </div>

              {(uploadingInlineImage) && (
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processando upload de imagem...
                </div>
              )}
            </section>

            <section className="flex min-h-0 flex-col rounded-2xl border border-border/70 bg-card/35 p-4 xl:col-span-9">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Conteudo da pagina (editor rico) *
              </label>
              <div className="min-h-0 flex-1 overflow-hidden rounded-xl border border-border/70 bg-background/70">
                <RichTextEditor
                  value={contentHtml}
                  onChange={setContentHtml}
                  onUploadImage={handleInlineImageUpload}
                  disabled={loading}
                  editorMinHeightClass="min-h-[360px]"
                  contentScrollHeightClass="max-h-[calc(100vh-28rem)]"
                />
              </div>
            </section>
          </div>

          <footer className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-card/55 px-4 py-3">
            <p className="text-xs text-muted-foreground">
              Os serviços alimentam a home, a página /servicos e a futura página individual por slug.
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </footer>

          {error && <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>}
        </form>
      </Card>
    </div>
  );
};