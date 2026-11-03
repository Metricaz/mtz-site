import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, RefreshCw, UserRound } from 'lucide-react';
import { Nav } from '@/components/site/Nav';
import { PageHead } from '@/components/PageHead';
import { articleSchema } from '@/lib/structured-data';
import { Footer } from '@/components/site/Footer';
import { usePosts } from '@/hooks/usePosts';
import { formatShortDate } from '@/lib/dates';
import { NotFoundStatus } from '@/components/NotFoundStatus';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { posts } = usePosts({ slug, enabled: Boolean(slug) });
  const post = posts[0] ?? null;

  if (!post) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <NotFoundStatus />
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
      <PageHead
        title={post.seo_title}
        name={post.title}
        description={post.seo_description || post.subtitle}
        image={post.featured_image}
        type="article"
        breadcrumb={[{ label: 'Blog', href: '/blog' }]}
        schema={(context) =>
          articleSchema(context, {
            type: 'BlogPosting',
            headline: post.title,
            description: post.seo_description || post.subtitle,
            image: post.featured_image,
            datePublished: post.published_at,
            // Only a real revision counts as a change (updated_at moves on any save, e.g. the site migration).
            dateModified: post.reviewed_at || post.published_at,
            author: post.author,
          })
        }
      />
      <Nav useHomeSectionLinks />

      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <Link to="/blog" className="mb-8 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o blog
          </Link>
          {post.tag && (
            <div className="mb-6">
              <Link
                to={`/blog/categoria/${post.tag.slug}`}
                className="mono-tag rounded-full bg-primary px-3 py-1.5 text-primary-foreground transition-colors hover:bg-primary-glow"
              >
                {post.tag.name}
              </Link>
            </div>
          )}
          <h1 className="editorial text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]">{post.title}</h1>
          {post.subtitle && <p className="mt-6 max-w-3xl text-base text-foreground/85 md:text-lg">{post.subtitle}</p>}

          <div className="mt-8 flex flex-wrap gap-3 text-sm text-foreground/80">
            {post.author && (
              <Link
                to={`/autor/${post.author.slug}`}
                rel="author"
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/55 px-4 py-3 transition-colors hover:border-primary/40 hover:text-foreground"
              >
                <UserRound className="h-4 w-4 text-muted-foreground" />
                {post.author.name}
              </Link>
            )}
            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/55 px-4 py-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <time dateTime={post.published_at}>{formatShortDate(post.published_at)}</time>
            </div>
            {post.reviewed_at && post.reviewed_at > post.published_at && (
              <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/55 px-4 py-3">
                <RefreshCw className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                Atualizado em <time dateTime={post.reviewed_at}>{formatShortDate(post.reviewed_at)}</time>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-14">
        <div className="container-x">
          <figure className="overflow-hidden rounded-3xl border border-border bg-card/45">
            <img
              src={post.featured_image}
              alt={post.featured_image_alt || post.title}
              width={1536}
              height={1152}
              // React 18 only passes the lowercase HTML attribute through to the <img>.
              {...{ fetchpriority: "high" }}
              className="h-[260px] w-full object-cover md:h-[500px]"
            />
          </figure>

          <article className="case-content blog-content mt-12 max-w-4xl" dangerouslySetInnerHTML={{ __html: post.content_html }} />

          {post.author && (
            <aside className="mt-16 flex max-w-4xl flex-col gap-6 rounded-3xl border border-border bg-card/55 p-6 sm:flex-row sm:items-start md:p-8">
              {post.author.photo && (
                <img
                  src={post.author.photo}
                  alt={post.author.name}
                  width={96}
                  height={96}
                  loading="lazy"
                  decoding="async"
                  className="h-20 w-20 shrink-0 rounded-full border border-border object-cover md:h-24 md:w-24"
                />
              )}
              <div>
                <p className="eyebrow">Sobre o autor</p>
                <p className="editorial mt-3 text-2xl md:text-3xl">{post.author.name}</p>
                {post.author.role && <p className="mt-1 text-sm text-primary">{post.author.role}</p>}
                {post.author.mini_bio && <p className="mt-3 text-sm leading-7 text-muted-foreground md:text-base">{post.author.mini_bio}</p>}
                <Link
                  to={`/autor/${post.author.slug}`}
                  rel="author"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Ver todos os posts de {post.author.name} →
                </Link>
              </div>
            </aside>
          )}
        </div>
      </section>

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default BlogPostPage;
