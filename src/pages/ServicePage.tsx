import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useServices } from '@/hooks/useServices';
import { OptionText } from '@/components/site/OptionText';
import { Nav } from '@/components/site/Nav';
import { PageHead } from '@/components/PageHead';
import { faqSchema, serviceSchema } from '@/lib/structured-data';
import { useFaq } from '@/hooks/useFaq';
import { FaqSection } from '@/components/site/FaqSection';
import { Footer } from '@/components/site/Footer';
import { getServiceIcon } from '@/lib/service-icons';
import { NotFoundStatus } from '@/components/NotFoundStatus';
import { Service } from '@/lib/api-types';

type RelatedLinksProps = { links: Service['related_links'] | undefined };

/** Cases and posts picked in the service's admin page: internal links with the destination's own title. */
const RelatedLinks = ({ links }: RelatedLinksProps) => {
  const items = [
    ...(links?.cases ?? []).map((item) => ({ ...item, kind: 'Case', href: `/cases/${item.slug}` })),
    ...(links?.posts ?? []).map((item) => ({ ...item, kind: 'Blog', href: `/blog/${item.slug}` })),
  ];
  if (items.length === 0) return null;

  return (
    <section className="pb-12 md:pb-16">
      <div className="container-x">
        <OptionText
          k="servicepage.related_title"
          as="h2"
          className="editorial mb-10 text-4xl leading-tight md:text-5xl"
          accentClassName="editorial-italic text-primary"
        />
        <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                to={item.href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              >
                <span className="mono-tag text-primary">{item.kind}</span>
                <h3 className="mt-3 text-xl font-medium leading-snug group-hover:text-primary">{item.title}</h3>
                {item.excerpt && <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{item.excerpt}</p>}
                <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm text-primary">
                  {item.kind === 'Case' ? 'Ver o case' : 'Ler o post'}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

const ServicePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { services } = useServices({ slug, enabled: Boolean(slug) });
  const service = services[0] ?? null;
  const { items: faq } = useFaq(slug ?? '');

  if (!service) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <NotFoundStatus />
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
      <PageHead
        title={service.seo_title}
        name={service.title}
        description={service.seo_description || service.excerpt}
        breadcrumb={[{ label: 'Serviços', href: '/servicos' }]}
        schema={(context) => [serviceSchema(context, service.title, service.excerpt), ...faqSchema(faq)]}
      />
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
              <h1 className="editorial text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]">{service.headline || service.title}</h1>
              <p className="mt-5 max-w-3xl text-base text-foreground/85 md:text-lg">{service.excerpt}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x">
          <article className="case-content max-w-4xl" dangerouslySetInnerHTML={{ __html: service.content_html }} />
        </div>
      </section>

      <FaqSection items={faq} className="pb-12 md:pb-16" />
      <RelatedLinks links={service.related_links} />

      <section className="pb-12 md:pb-16">
        <div className="container-x">

          <div className="rounded-3xl border border-border bg-card/55 p-6 md:p-8">
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
                to="/contato"
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