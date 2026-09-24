import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { usePosts } from '@/hooks/usePosts';
import { formatShortDate } from '@/lib/dates';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { posts, loading } = usePosts({ slug, enabled: Boolean(slug) });
  const post = posts[0] ?? null;

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Nav useHomeSectionLinks />
        <div className="container-x py-20">
          <div className="h-10 w-56 animate-pulse rounded bg-card/60" />
          <div className="mt-8 h-[360px] animate-pulse rounded-3xl bg-card/60" />
          <div className="mt-10 h-6 w-2/3 animate-pulse rounded bg-card/60" />
          <div className="mt-4 h-6 w-1/2 animate-pulse rounded bg-card/60" />
        </div>
        <Footer useHomeSectionLinks />
      </main>
    );
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <Nav useHomeSectionLinks />
        <div className="container-x py-20">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o blog
          </Link>
          <h1 className="mt-10 editorial text-5xl">Post não encontrado</h1>
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
          <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o blog
          </Link>
          {post.tag && (
            <div className="mb-6">
              <span className="mono-tag rounded-full bg-primary px-3 py-1.5 text-primary-foreground">{post.tag.name}</span>
            </div>
          )}
          <h1 className="editorial text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]">{post.title}</h1>
          {post.subtitle && <p className="mt-6 max-w-3xl text-base text-foreground/85 md:text-lg">{post.subtitle}</p>}

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-foreground/80">
            {post.author && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/55 px-4 py-3">
                <UserRound className="h-4 w-4 text-muted-foreground" />
                {post.author.name}
              </div>
            )}
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/55 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              {formatShortDate(post.published_at)}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-x">
          <figure className="overflow-hidden rounded-3xl border border-border bg-card/45">
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              className="h-[260px] w-full object-cover md:h-[500px]"
            />
          </figure>

          <article className="case-content blog-content mt-12 max-w-4xl" dangerouslySetInnerHTML={{ __html: post.content_html }} />

          {post.author && (
            <aside className="mt-16 max-w-4xl rounded-3xl border border-border bg-card/55 p-6 md:p-8">
              <p className="eyebrow">Sobre o autor</p>
              <p className="editorial mt-3 text-2xl md:text-3xl">{post.author.name}</p>
              {post.author.mini_bio && <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{post.author.mini_bio}</p>}
            </aside>
          )}
        </div>
      </section>

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default BlogPostPage;
