import { useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SiteCase } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Loader2, Upload, X } from 'lucide-react';

interface CaseFormProps {
  caseItem?: SiteCase | null;
  userId?: number;
  onClose: () => void;
  onSuccess: () => void;
}

const CASES_BUCKET = 'cases-media';

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

export const CaseForm = ({ caseItem, userId, onClose, onSuccess }: CaseFormProps) => {
  const [title, setTitle] = useState(caseItem?.title || '');
  const [slug, setSlug] = useState(caseItem?.slug || '');
  const [tag, setTag] = useState(caseItem?.tag || 'Digital Analytics');
  const [excerpt, setExcerpt] = useState(caseItem?.excerpt || '');
  const [kpiValue, setKpiValue] = useState(caseItem?.kpi_value || '');
  const [kpiLabel, setKpiLabel] = useState(caseItem?.kpi_label || '');
  const [clientName, setClientName] = useState(caseItem?.client_name || '');
  const [serviceStack, setServiceStack] = useState(caseItem?.service_stack || '');
  const [featuredImageUrl, setFeaturedImageUrl] = useState(caseItem?.featured_image_url || '');
  const [featuredImageAlt, setFeaturedImageAlt] = useState(caseItem?.featured_image_alt || '');
  const [contentHtml, setContentHtml] = useState(
    caseItem?.content_html || '<h2>Contexto</h2><p>Descreva aqui o contexto do projeto.</p>'
  );
  const [loading, setLoading] = useState(false);
  const [uploadingFeaturedImage, setUploadingFeaturedImage] = useState(false);
  const [uploadingInlineImage, setUploadingInlineImage] = useState(false);
  const [error, setError] = useState('');

  const slugPreview = useMemo(() => (slug ? `/cases/${slug}` : '/cases/seu-slug'), [slug]);

  const handleGenerateSlug = () => {
    setSlug(toSlug(title));
  };

  const uploadImageToSupabase = async (file: File, folder: string) => {
    const safeSlug = toSlug(slug || title) || 'case';
    const filePath = `${folder}/${safeSlug}/${Date.now()}-${sanitizeFileName(file.name)}`;

    const { error: uploadError } = await supabase.storage
      .from(CASES_BUCKET)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw new Error(`Falha no upload para Supabase Storage: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage.from(CASES_BUCKET).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  };

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setError('');
    setUploadingFeaturedImage(true);

    try {
      const uploadedUrl = await uploadImageToSupabase(file, 'featured');
      setFeaturedImageUrl(uploadedUrl);

      if (!featuredImageAlt.trim()) {
        setFeaturedImageAlt(title.trim() || file.name);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao subir imagem de destaque.');
    } finally {
      setUploadingFeaturedImage(false);
      event.target.value = '';
    }
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

      if (
        !title.trim() ||
        !normalizedSlug ||
        !tag.trim() ||
        !excerpt.trim() ||
        !kpiValue.trim() ||
        !kpiLabel.trim() ||
        !featuredImageUrl.trim() ||
        !contentHtml.trim()
      ) {
        throw new Error('Preencha todos os campos obrigatorios.');
      }

      if (caseItem) {
        const { error: updateError } = await supabase
          .from('s_cases')
          .update({
            title: title.trim(),
            slug: normalizedSlug,
            tag: tag.trim(),
            excerpt: excerpt.trim(),
            kpi_value: kpiValue.trim(),
            kpi_label: kpiLabel.trim(),
            client_name: clientName.trim() || null,
            service_stack: serviceStack.trim() || null,
            featured_image_url: featuredImageUrl.trim(),
            featured_image_alt: featuredImageAlt.trim() || title.trim(),
            content_html: contentHtml.trim(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', caseItem.id);

        if (updateError) throw updateError;
      } else {
        if (!userId) throw new Error('User ID nao encontrado.');

        const { error: insertError } = await supabase
          .from('s_cases')
          .insert([
            {
              title: title.trim(),
              slug: normalizedSlug,
              tag: tag.trim(),
              excerpt: excerpt.trim(),
              kpi_value: kpiValue.trim(),
              kpi_label: kpiLabel.trim(),
              client_name: clientName.trim() || null,
              service_stack: serviceStack.trim() || null,
              featured_image_url: featuredImageUrl.trim(),
              featured_image_alt: featuredImageAlt.trim() || title.trim(),
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
      const message = err instanceof Error ? err.message : 'Erro ao salvar case.';
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
      <Card className="grid h-[calc(100vh-1.5rem)] w-full max-w-[1720px] grid-rows-[auto_1fr_auto] overflow-hidden border-border/80 bg-card/95 p-4 shadow-card md:h-[calc(100vh-2rem)] md:p-6">
        <header className="mb-3 flex items-center justify-between rounded-2xl border border-border/70 bg-card/55 px-4 py-3">
          <div>
            <h2 className="text-2xl font-bold">{caseItem ? 'Editar Case' : 'Adicionar Case'}</h2>
            <p className="text-xs text-muted-foreground">Fluxo otimizado para produção de conteúdo em tela widescreen.</p>
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
                  placeholder="Ex: Livelo + GA4"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="tag" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Tag *
                </label>
                <Input
                  id="tag"
                  value={tag}
                  onChange={(event) => setTag(event.target.value)}
                  placeholder="Ex: Digital Analytics"
                  disabled={loading}
                  required
                />
              </div>

              <div className="grid gap-2 grid-cols-[1fr_auto]">
                <div>
                  <label htmlFor="slug" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                    Slug *
                  </label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(event) => setSlug(event.target.value)}
                    placeholder="livelo-ga4"
                    disabled={loading}
                    required
                  />
                  <p className="mt-1 truncate text-xs text-muted-foreground">URL: {slugPreview}</p>
                </div>
                <div className="flex items-end">
                  <Button type="button" variant="outline" onClick={handleGenerateSlug} disabled={loading || !title.trim()}>
                    Gerar
                  </Button>
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
                  rows={3}
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="clientName" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Cliente
                </label>
                <Input
                  id="clientName"
                  value={clientName}
                  onChange={(event) => setClientName(event.target.value)}
                  placeholder="Ex: Livelo"
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="serviceStack" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Stack de servicos
                </label>
                <Input
                  id="serviceStack"
                  value={serviceStack}
                  onChange={(event) => setServiceStack(event.target.value)}
                  placeholder="Ex: GA4, Google Ads, Tagueamento"
                  disabled={loading}
                />
              </div>
            </section>

            <section className="space-y-3 rounded-2xl border border-border/70 bg-card/35 p-4 xl:col-span-3">
              <div>
                <label htmlFor="kpiValue" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  KPI valor *
                </label>
                <Input
                  id="kpiValue"
                  value={kpiValue}
                  onChange={(event) => setKpiValue(event.target.value)}
                  placeholder="Ex: +212%"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="kpiLabel" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  KPI descricao *
                </label>
                <Input
                  id="kpiLabel"
                  value={kpiLabel}
                  onChange={(event) => setKpiLabel(event.target.value)}
                  placeholder="Ex: Precisao dos eventos"
                  disabled={loading}
                  required
                />
              </div>

              <div>
                <label htmlFor="featuredImageUpload" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Imagem destaque *
                </label>
                <Input
                  id="featuredImageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFeaturedImageUpload}
                  disabled={loading || uploadingFeaturedImage}
                />
                <p className="mt-1 text-xs text-muted-foreground">Upload direto em {CASES_BUCKET}.</p>
                {featuredImageUrl && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-border bg-muted/30">
                    <img src={featuredImageUrl} alt={featuredImageAlt || title} className="h-32 w-full object-cover" />
                  </div>
                )}
                <div className="mt-1 line-clamp-2 break-all text-xs text-muted-foreground">
                  {featuredImageUrl || 'Nenhuma imagem enviada ainda.'}
                </div>
              </div>

              <div>
                <label htmlFor="featuredImageAlt" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                  Alt da imagem
                </label>
                <Input
                  id="featuredImageAlt"
                  value={featuredImageAlt}
                  onChange={(event) => setFeaturedImageAlt(event.target.value)}
                  placeholder="Descricao da imagem"
                  disabled={loading}
                />
              </div>

              {(uploadingFeaturedImage || uploadingInlineImage) && (
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Processando upload de imagem...
                </div>
              )}
            </section>

            <section className="flex min-h-0 flex-col rounded-2xl border border-border/70 bg-card/35 p-4 xl:col-span-6">
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                Conteudo da pagina (editor rico) *
              </label>
              <div className="min-h-0 flex-1 overflow-auto">
                <RichTextEditor
                  value={contentHtml}
                  onChange={setContentHtml}
                  onUploadImage={handleInlineImageUpload}
                  disabled={loading || uploadingInlineImage}
                  editorMinHeightClass="min-h-[56vh]"
                  contentScrollHeightClass="max-h-[52vh] xl:max-h-[56vh]"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Use H2, H3, negrito, italico, listas e imagens para construir uma pagina editorial completa.
              </p>
            </section>
          </div>

          <footer className="grid gap-3 rounded-2xl border border-border/70 bg-card/55 p-3 md:grid-cols-[1fr_auto_auto] md:items-center">
            {error ? (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                Todos os campos marcados com * sao obrigatorios.
              </div>
            )}
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || uploadingFeaturedImage || uploadingInlineImage}
              className="min-w-[170px]"
            >
              {loading ? 'Salvando...' : 'Salvar Case'}
            </Button>
          </footer>
        </form>
      </Card>
    </div>
  );
};
