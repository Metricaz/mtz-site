import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Nav } from '@/components/site/Nav';
import { PageHead } from '@/components/PageHead';
import { Footer } from '@/components/site/Footer';
import { PostGrid } from '@/components/site/PostGrid';
import { BlogSearchForm } from '@/components/site/BlogSearchForm';
import { usePosts } from '@/hooks/usePosts';

/** /blog/busca?q=<words>: published posts with every word (any case or accent) in the title, subtitle or text. Kept out of Google. */
const BlogSearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const { posts } = usePosts({ q: query, enabled: Boolean(query) });

  const count = posts.length === 1 ? '1 post encontrado' : `${posts.length} posts encontrados`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHead name={query ? `Busca: ${query} · Blog` : 'Busca · Blog'} breadcrumb={[{ label: 'Blog', href: '/blog' }]} noindex />
      <Nav useHomeSectionLinks />

      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o blog
          </Link>
          <p className="mono-tag mt-8 text-muted-foreground">Busca no blog</p>
          <h1 className="editorial mt-4 break-words text-[clamp(2.25rem,5vw,4.5rem)] leading-[0.95]">
            {query ? (
              <>
                Resultados para <span className="editorial-italic text-primary">“{query}”</span>
              </>
            ) : (
              'O que você procura?'
            )}
          </h1>
          {/* key: the box shows the new words when the search changes. */}
          <BlogSearchForm key={query} initialQuery={query} className="mt-8" />
        </div>
      </section>

      {query && (
        <section className="py-12 md:py-16">
          <div className="container-x">
            {posts.length > 0 ? (
              <>
                <p className="mb-8 text-sm text-muted-foreground" aria-live="polite">
                  {count}
                </p>
                <PostGrid posts={posts} />
              </>
            ) : (
              <div className="max-w-xl" aria-live="polite">
                <p className="editorial text-2xl md:text-3xl">Nenhum post encontrado.</p>
                <p className="mt-3 text-muted-foreground">
                  Tente outras palavras ou{' '}
                  <Link to="/blog" className="text-primary underline-offset-4 hover:underline">
                    veja todos os posts do blog
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default BlogSearchPage;
