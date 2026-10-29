"""
/sitemap.xml: every public page of the site, for search engines (SEO and GEO audit, P0).

Addresses use the host the request came in through (no django.contrib.sites), so each environment
lists its own pages; only active items are listed. Paths must match the React routes (src/App.tsx).
"""

from django.contrib.sitemaps import Sitemap

from .models import Case, Page, Post, Service


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


class PageSitemap(ContentSitemap):
    model = Page


SITEMAPS = {
    "fixed": FixedPagesSitemap,
    "services": ServiceSitemap,
    "cases": CaseSitemap,
    "posts": PostSitemap,
    "pages": PageSitemap,
}
