import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { OptionText } from '@/components/site/OptionText';
import { usePosts } from '@/hooks/usePosts';
import { formatShortDate } from '@/lib/dates';

const BlogPage = () => {
  const { posts, loading } = usePosts();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav useHomeSectionLinks />

      {/* Same header copy as the home "Conteúdo" section (keys content.eyebrow / content.title). */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <div className="mb-6">
            <OptionText k="content.eyebrow" className="mono-tag rounded-full bg-primary/15 px-3 py-1.5 text-primary" />
          </div>
          <OptionText
            k="content.title"
            as="h1"
            className="editorial text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]"
            accentClassName="editorial-italic text-primary"
          />
        </div>
      </section>

      {(loading || posts.length > 0) && (
        <section className="py-12 md:py-16">
          <div className="container-x">
            {loading && posts.length === 0 ? (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div key={index} className="h-[380px] animate-pulse rounded-3xl border border-border bg-card/40" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {posts.map((post) => (
                  <Link
                    key={post.id}
                    to={`/blog/${post.slug}`}
                    className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card/55 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-card">
                      <img
                        src={post.featured_image}
                        alt={post.featured_image_alt || post.title}
                        loading="lazy"
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        {post.tag && (
                          <span className="inline-flex items-center gap-1.5 font-medium text-foreground">
                            <span className="text-primary">✱</span>
                            {post.tag.name}
                          </span>
                        )}
                        <span className="text-muted-foreground">📅 {formatShortDate(post.published_at)}</span>
                      </div>
                      <h2 className="mt-4 text-xl font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
                        {post.title}
                      </h2>
                      {post.subtitle && <p className="mt-3 flex-1 text-sm leading-7 text-muted-foreground">{post.subtitle}</p>}
                      <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                        Ler post
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default BlogPage;
