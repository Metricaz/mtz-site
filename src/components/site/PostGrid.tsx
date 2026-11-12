import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { formatShortDate } from '@/lib/dates';
import { Post } from '@/lib/api-types';

/** Post cards (blog, category and author pages). The whole card is the link, title included. */
export const PostGrid = ({ posts }: { posts: Post[] }) => (
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
            width={1024}
            height={768}
            loading="lazy"
            decoding="async"
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
);
