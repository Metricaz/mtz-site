import { useApiList } from '@/hooks/useApiList';
import { Post } from '@/lib/api-types';

interface UsePostsOptions {
  limit?: number;
  slug?: string;
  tag?: string;
  enabled?: boolean;
}

/** Published blog posts, newest first (Django admin → Posts). */
export const usePosts = (options?: UsePostsOptions) => {
  const posts = useApiList<Post>(
    '/posts/',
    { limit: options?.limit, slug: options?.slug, tag: options?.tag },
    options?.enabled ?? true,
  );
  return { posts };
};
