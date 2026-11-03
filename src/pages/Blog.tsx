import { Link } from 'react-router-dom';
import { Nav } from '@/components/site/Nav';
import { OptionPageHead } from '@/components/PageHead';
import { Footer } from '@/components/site/Footer';
import { OptionText } from '@/components/site/OptionText';
import { usePosts } from '@/hooks/usePosts';
import { PostGrid } from '@/components/site/PostGrid';
import { collectionSchema } from '@/lib/structured-data';

const BlogPage = () => {
  const { posts } = usePosts();
  // Categories that have published posts, each with its own page (/blog/categoria/<slug>).
  const categories = [...new Map(posts.flatMap((post) => (post.tag ? [[post.tag.id, post.tag] as const] : []))).values()];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <OptionPageHead
        page="blog"
        crumb="Blog"
        schema={(context) =>
          collectionSchema(context, {
            type: "Blog",
            name: "Blog",
            items: posts.map((post) => ({ name: post.title, path: `/blog/${post.slug}` })),
          })
        }
      />
      <Nav useHomeSectionLinks />

      {/* Same header copy as the home "Conteúdo" section (keys content.eyebrow / content.title). */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <div className="mb-6">
            <OptionText k="content.eyebrow" className="mono-tag rounded-full bg-primary/15 px-3 py-1.5 text-primary" />
          </div>
          <OptionText
            k="blogpage.title"
            as="h1"
            className="editorial text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]"
            accentClassName="editorial-italic text-primary"
          />
        </div>
      </section>

      {categories.length > 1 && (
        <nav aria-label="Categorias do blog" className="container-x pt-10">
          <ul className="flex flex-wrap gap-2">
            {categories.map((tag) => (
              <li key={tag.id}>
                <Link
                  to={`/blog/categoria/${tag.slug}`}
                  className="inline-flex rounded-full border border-border bg-card/55 px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {tag.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {posts.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container-x">
            <PostGrid posts={posts} />
          </div>
        </section>
      )}

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default BlogPage;
