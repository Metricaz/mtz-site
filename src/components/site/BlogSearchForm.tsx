import { FormEvent, useState } from 'react';
import { useHref, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * "Buscar no blog" box: goes to /blog/busca?q=<words>. A plain GET form, so it also works
 * before the page's JavaScript loads; once it has, the search opens without reloading the page.
 */
export const BlogSearchForm = ({ initialQuery = '', className }: { initialQuery?: string; className?: string }) => {
  const [query, setQuery] = useState(initialQuery);
  const navigate = useNavigate();
  const action = useHref('/blog/busca');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const words = query.trim();
    if (words) navigate(`/blog/busca?${new URLSearchParams({ q: words })}`);
  };

  return (
    <form role="search" action={action} method="get" onSubmit={handleSubmit} className={cn('relative w-full max-w-md', className)}>
      <label htmlFor="blog-search" className="sr-only">
        Buscar no blog
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <input
        id="blog-search"
        type="search"
        name="q"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar no blog"
        maxLength={100}
        required
        className="h-12 w-full rounded-full border border-border bg-card/55 pl-11 pr-28 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 md:text-sm"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-glow"
      >
        Buscar
      </button>
    </form>
  );
};
