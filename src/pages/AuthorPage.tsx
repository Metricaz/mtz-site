import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Linkedin } from 'lucide-react';
import { Nav } from '@/components/site/Nav';
import { PageHead } from '@/components/PageHead';
import { Footer } from '@/components/site/Footer';
import { PostGrid } from '@/components/site/PostGrid';
import { NotFoundStatus } from '@/components/NotFoundStatus';
import { useApiList } from '@/hooks/useApiList';
import { usePosts } from '@/hooks/usePosts';
import { Author } from '@/lib/api-types';
import { personSchema } from '@/lib/structured-data';

/** /autor/<slug>: who writes on the blog (Django admin → Autores) and their posts. */
const AuthorPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const author = useApiList<Author>('/authors/', { slug }, Boolean(slug))[0] ?? null;
  const { posts } = usePosts({ author: slug, enabled: Boolean(author) });

  if (!author) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <NotFoundStatus />
        <Nav useHomeSectionLinks />
        <div className="container-x py-32">
          <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
            <ArrowLeft className="h-4 w-4" />
            Voltar para o blog
          </Link>
          <h1 className="mt-10 editorial text-5xl">Autor não encontrado</h1>
        </div>
        <Footer useHomeSectionLinks />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHead
        name={author.name}
        description={author.mini_bio || [author.name, author.role].filter(Boolean).join(', ')}
        image={author.photo}
        type="profile"
        breadcrumb={[{ label: 'Blog', href: '/blog' }]}
        schema={(context) => ({ '@type': 'ProfilePage', url: context.pageUrl, mainEntity: personSchema(context, author) })}
      />
      <Nav useHomeSectionLinks />

      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x flex flex-col gap-8 md:flex-row md:items-center">
          {author.photo && (
            <img
              src={author.photo}
              alt={author.name}
              width={192}
              height={192}
              className="h-32 w-32 shrink-0 rounded-full border border-border object-cover md:h-48 md:w-48"
            />
          )}
          <div className="max-w-3xl">
            <p className="mono-tag text-muted-foreground">Autor</p>
            <h1 className="editorial mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95]">{author.name}</h1>
            {author.role && <p className="mt-4 text-lg text-primary">{author.role}</p>}
            {author.mini_bio && (
              <p className="mt-6 whitespace-pre-line text-base leading-7 text-foreground/85 md:text-lg">{author.mini_bio}</p>
            )}
            {author.linkedin_url && (
              <a
                href={author.linkedin_url}
                target="_blank"
                rel="noreferrer me"
                className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/55 px-5 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-card"
              >
                <Linkedin className="h-4 w-4" aria-hidden="true" />
                LinkedIn de {author.name}
              </a>
            )}
          </div>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container-x">
            <h2 className="editorial mb-8 text-3xl md:text-4xl">Posts de {author.name}</h2>
            <PostGrid posts={posts} />
          </div>
        </section>
      )}

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default AuthorPage;
