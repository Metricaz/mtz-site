import { useParams } from 'react-router-dom';
import { Nav } from '@/components/site/Nav';
import { PageHead } from '@/components/PageHead';
import { Footer } from '@/components/site/Footer';
import { useApiList } from '@/hooks/useApiList';
import { Page } from '@/lib/api-types';
import NotFound from './NotFound';

/** Institutional pages edited in the admin (Política de Privacidade, Termos de Uso…), at /<slug>. */
const InstitutionalPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const page = useApiList<Page>('/pages/', { slug }, Boolean(slug))[0] ?? null;

  // Any other one-segment address lands here too: no page with that slug = the regular "not found".
  if (!page) return <NotFound />;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHead title={page.seo_title} name={page.title} description={page.seo_description} breadcrumb={[]} />
      <Nav useHomeSectionLinks />

      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <h1 className="editorial text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]">{page.title}</h1>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x">
          <article className="case-content max-w-4xl" dangerouslySetInnerHTML={{ __html: page.content_html }} />
        </div>
      </section>

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default InstitutionalPage;
