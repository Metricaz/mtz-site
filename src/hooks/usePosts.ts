import { useApiList } from '@/hooks/useApiList';
import { Post } from '@/lib/api-types';

interface UsePostsOptions {
  limit?: number;
  slug?: string;
  tag?: string;
  /** Author slug. */
  author?: string;
  /** Search words (title, subtitle and text). */
  q?: string;
  enabled?: boolean;
}

/** Published blog posts, newest first (Django admin → Posts). */
export const usePosts = (options?: UsePostsOptions) => {
  const posts = useApiList<Post>(
    '/posts/',
    { limit: options?.limit, slug: options?.slug, tag: options?.tag, author: options?.author, q: options?.q },
    options?.enabled ?? true,
  );
  return { posts };
};
