import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { OptionText } from '@/components/site/OptionText';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { getServiceIcon } from '@/lib/service-icons';

const ServicePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { services, loading } = useServices({ slug, enabled: Boolean(slug) });
  const service = services[0] ?? null;

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Nav useHomeSectionLinks />
        <div className="container-x py-20">
          <div className="h-10 w-56 animate-pulse rounded bg-card/60" />
          <div className="mt-8 h-[320px] animate-pulse rounded-3xl bg-card/60" />
          <div className="mt-10 h-6 w-2/3 animate-pulse rounded bg-card/60" />
          <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-card/60" />
        </div>
        <Footer useHomeSectionLinks />
      </main>
    );
  }

  if (!service) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Nav useHomeSectionLinks />
        <div className="container-x py-20">
          <Link to="/servicos" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
            <ArrowLeft className="h-4 w-4" />
            Voltar para serviços
          </Link>
          <h1 className="editorial mt-10 text-5xl">Serviço não encontrado</h1>
          <p className="mt-4 max-w-lg text-muted-foreground">
            Este conteúdo pode ter sido removido, desativado ou ainda não publicado no painel.
          </p>
        </div>
        <Footer useHomeSectionLinks />
      </main>
    );
  }

  const Icon = getServiceIcon(service.icon_name);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav useHomeSectionLinks />

      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <div className="mb-6">
            <OptionText k="servicepage.eyebrow" className="mono-tag rounded-full bg-primary px-3 py-1.5 text-primary-foreground" />
          </div>
          <div className="flex items-start gap-4 md:gap-6">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <Icon className="h-8 w-8" />
            </div>
            <div className="min-w-0">
              <h1 className="editorial text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]">{service.title}</h1>
              <p className="mt-5 max-w-3xl text-base text-foreground/85 md:text-lg">{service.excerpt}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x">
          <article className="case-content max-w-4xl" dangerouslySetInnerHTML={{ __html: service.content_html }} />

          <div className="mt-14 rounded-3xl border border-border bg-card/55 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <OptionText k="servicepage.cta_eyebrow" as="p" className="eyebrow" />
                <OptionText
                  k="servicepage.cta_title"
                  as="h2"
                  className="editorial mt-3 text-3xl md:text-5xl"
                  accentClassName="editorial-italic text-primary"
                />
              </div>
              <Link
                to="/#contato"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-glow"
              >
                Falar com a gente
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default ServicePage;