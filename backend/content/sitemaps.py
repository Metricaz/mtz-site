"""
/sitemap.xml: every public page of the site, for search engines (SEO and GEO audit, P0).

Addresses use the host the request came in through (no django.contrib.sites), so each environment
lists its own pages; only active items are listed. Paths must match the React routes (src/App.tsx).
"""

from django.contrib.sitemaps import Sitemap
from django.db.models import Max, Q

from .models import Author, Case, Page, Post, Service, Tag


class FixedPagesSitemap(Sitemap):
    def items(self):
        return ["/", "/quem-somos", "/servicos", "/cases", "/blog", "/contato"]

    def location(self, item):
        return item


class ContentSitemap(Sitemap):
    """Items of `model` with a slug, at `prefix` + slug."""

    model = None
    prefix = "/"

    def items(self):
        return self.model.objects.filter(is_active=True)

    def location(self, item):
        return f"{self.prefix}{item.slug}"

    def lastmod(self, item):
        return item.updated_at


class ServiceSitemap(ContentSitemap):
    model = Service
    prefix = "/servicos/"


class CaseSitemap(ContentSitemap):
    model = Case
    prefix = "/cases/"


class PostSitemap(ContentSitemap):
    model = Post
    prefix = "/blog/"

    def lastmod(self, item):
        # Same date the post shows and sends as dateModified, not the last save in the admin.
        return item.reviewed_at or item.published_at


class PageSitemap(ContentSitemap):
    model = Page


class PostGroupSitemap(Sitemap):
    """Author and category pages: only those with at least one published post (the others are empty)."""

    model = None
    prefix = "/"

    def items(self):
        return (
            self.model.objects.annotate(last_post=Max("posts__published_at", filter=Q(posts__is_active=True)))
            .filter(last_post__isnull=False)
            .order_by("name")
        )

    def location(self, item):
        return f"{self.prefix}{item.slug}"

    def lastmod(self, item):
        return item.last_post


class AuthorSitemap(PostGroupSitemap):
    model = Author
    prefix = "/autor/"


class TagSitemap(PostGroupSitemap):
    model = Tag
    prefix = "/blog/categoria/"


SITEMAPS = {
    "fixed": FixedPagesSitemap,
    "services": ServiceSitemap,
    "cases": CaseSitemap,
    "posts": PostSitemap,
    "pages": PageSitemap,
    "authors": AuthorSitemap,
    "categories": TagSitemap,
}
