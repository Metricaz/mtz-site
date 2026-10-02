import { Pencil } from 'lucide-react';
import { Post } from '@/lib/api-types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ItemBadges } from '@/components/dashboard/ItemBadges';
import { formatShortDate } from '@/lib/dates';

interface PostListProps {
  posts: Post[];
  onEdit: (post: Post) => void;
}

export const PostList = ({ posts, onEdit }: PostListProps) => {
  if (posts.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhum post cadastrado ainda</p>
        <p className="mt-2 text-sm text-muted-foreground">Cadastre pelo admin do Django</p>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {posts.map((post) => (
        <Card key={post.id} className="p-4">
          <div className="flex flex-1 items-start gap-4">
            <div className="h-20 w-28 flex-shrink-0 overflow-hidden rounded bg-muted">
              <img
                src={post.featured_image}
                alt={post.featured_image_alt || post.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {post.tag && (
                  <span className="inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {post.tag.name}
                  </span>
                )}
                <span className="text-xs text-muted-foreground">/blog/{post.slug}</span>
                <ItemBadges isActive={post.is_active} />
              </div>
              <h3 className="text-lg font-semibold">{post.title}</h3>
              {post.subtitle && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.subtitle}</p>}
              <p className="mt-2 text-xs text-muted-foreground">
                {formatShortDate(post.published_at)}
                {post.author && ` · ${post.author.name}`}
              </p>
            </div>
            <Button type="button" variant="outline" size="sm" className="flex-shrink-0 gap-2" onClick={() => onEdit(post)}>
              <Pencil className="h-4 w-4" />
              Editar conteúdo
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
