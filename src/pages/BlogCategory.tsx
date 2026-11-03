import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Nav } from '@/components/site/Nav';
import { PageHead } from '@/components/PageHead';
import { Footer } from '@/components/site/Footer';
import { PostGrid } from '@/components/site/PostGrid';
import { NotFoundStatus } from '@/components/NotFoundStatus';
import { useApiList } from '@/hooks/useApiList';
import { usePosts } from '@/hooks/usePosts';
import { Tag } from '@/lib/api-types';
import { collectionSchema } from '@/lib/structured-data';

const BackToBlog = () => (
  <Link to="/blog" className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow">
    <ArrowLeft className="h-4 w-4" />
    Voltar para o blog
  </Link>
);

/** /blog/categoria/<slug>: the posts of one category (Django admin → Tags), with its opening text. */
const BlogCategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const tag = useApiList<Tag>('/tags/', { slug }, Boolean(slug))[0] ?? null;
  const { posts } = usePosts({ tag: slug, enabled: Boolean(tag) });

  // A category without published posts would be an empty page: answered as not found.
  if (!tag || posts.length === 0) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <NotFoundStatus />
        <Nav useHomeSectionLinks />
        <div className="container-x py-32">
          <BackToBlog />
          <h1 className="mt-10 editorial text-5xl">Categoria não encontrada</h1>
        </div>
        <Footer useHomeSectionLinks />
      </main>
    );
  }

  const name = `${tag.name} · Blog`;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <PageHead
        name={name}
        description={tag.description}
        breadcrumb={[{ label: 'Blog', href: '/blog' }]}
        schema={(context) =>
          collectionSchema(context, {
            name,
            items: posts.map((post) => ({ name: post.title, path: `/blog/${post.slug}` })),
          })
        }
      />
      <Nav useHomeSectionLinks />

      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <BackToBlog />
          <p className="mono-tag mt-8 text-muted-foreground">Categoria</p>
          <h1 className="editorial mt-4 text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]">{tag.name}</h1>
          {tag.description && (
            <p className="mt-6 max-w-3xl whitespace-pre-line text-base text-foreground/85 md:text-lg">{tag.description}</p>
          )}
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container-x">
          <PostGrid posts={posts} />
        </div>
      </section>

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default BlogCategoryPage;
