import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, FolderKanban, Gauge, UserRound } from 'lucide-react';
import { useCases } from '@/hooks/useCases';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { NotFoundStatus } from '@/components/NotFoundStatus';

const CasePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { cases } = useCases({ slug, enabled: Boolean(slug) });
  const caseItem = cases[0] ?? null;

  if (!caseItem) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <NotFoundStatus />
        <Nav useHomeSectionLinks />
        <div className="container-x py-20">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
            <ArrowLeft className="h-4 w-4" />
            Voltar para home
          </Link>
          <h1 className="mt-10 editorial text-5xl">Case não encontrado</h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Este conteúdo pode ter sido removido, desativado ou ainda não publicado no painel.
          </p>
        </div>
        <Footer useHomeSectionLinks />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav useHomeSectionLinks />

      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <div className="mb-6">
            <span className="mono-tag rounded-full bg-primary px-3 py-1.5 text-primary-foreground">{caseItem.tag}</span>
          </div>
          <h1 className="editorial text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]">{caseItem.title}</h1>
          <p className="mt-6 max-w-3xl text-base text-foreground/85 md:text-lg">{caseItem.excerpt}</p>

          <div className="mt-8 grid gap-3 text-sm text-foreground/80 md:grid-cols-4">
            <div className="rounded-xl border border-border bg-card/55 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <Gauge className="h-3.5 w-3.5" />
                Resultado destaque
              </div>
              <p className="editorial text-3xl text-primary">{caseItem.kpi_value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{caseItem.kpi_label}</p>
            </div>
            <div className="rounded-xl border border-border bg-card/55 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <UserRound className="h-3.5 w-3.5" />
                Cliente
              </div>
              <p>{caseItem.client_name || 'Não informado'}</p>
            </div>
            <div className="rounded-xl border border-border bg-card/55 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <FolderKanban className="h-3.5 w-3.5" />
                Escopo
              </div>
              <p>{caseItem.service_stack || 'Não informado'}</p>
            </div>
            <div className="rounded-xl border border-border bg-card/55 p-4">
              <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                Publicado em
              </div>
              <p>{new Date(caseItem.created_at).toLocaleDateString('pt-BR')}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-x">
          <figure className="overflow-hidden rounded-3xl border border-border bg-card/45">
            <img
              src={caseItem.featured_image}
              alt={caseItem.featured_image_alt || caseItem.title}
              className="h-[260px] w-full object-cover md:h-[500px]"
            />
          </figure>

          <article
            className="case-content mt-12"
            dangerouslySetInnerHTML={{ __html: caseItem.content_html }}
          />
        </div>
      </section>

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default CasePage;
