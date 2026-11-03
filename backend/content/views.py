from django.http import HttpResponse
from django.utils.dateparse import parse_datetime
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import ensure_csrf_cookie
from rest_framework import mixins, status, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from .models import (
    AboutHighlight,
    AboutPillar,
    Author,
    Case,
    Company,
    CompanyAddress,
    ContactSubmission,
    ContentImage,
    EngagementModel,
    Lead,
    MethodStep,
    NewsletterSubscriber,
    Page,
    Post,
    Sector,
    Service,
    SiteImage,
    SiteOption,
    SocialLink,
    Tag,
    TeamMember,
    Testimonial,
    WhatsAppClick,
    WhatsAppSettings,
)
from .permissions import IsStaff, is_staff
from .serializers import (
    AboutHighlightSerializer,
    AboutPillarSerializer,
    AuthorSerializer,
    CaseSerializer,
    CompanyAddressSerializer,
    CompanySerializer,
    ContactSubmissionSerializer,
    ContentImageSerializer,
    EngagementModelSerializer,
    FAQItemSerializer,
    LeadSerializer,
    MethodStepSerializer,
    NewsletterSubscriberSerializer,
    PageSerializer,
    PostSerializer,
    SectorSerializer,
    ServiceSerializer,
    SiteImageSerializer,
    SiteOptionSerializer,
    SocialLinkSerializer,
    TagSerializer,
    TeamMemberSerializer,
    TestimonialSerializer,
    WhatsAppClickSerializer,
    WhatsAppSettingsSerializer,
)

FILE_PARSERS = [JSONParser, MultiPartParser, FormParser]


# --- Search engines ------------------------------------------------------------------------------

# AI assistants and AI search are welcome (Metricaz sells GEO): named so the choice is explicit, not a default.
AI_CRAWLERS = [
    "GPTBot", "OAI-SearchBot", "ChatGPT-User",
    "ClaudeBot", "Claude-SearchBot", "Claude-User",
    "PerplexityBot", "Perplexity-User",
    "Google-Extended", "Applebot-Extended", "CCBot",
]

ROBOTS_RULES = """Allow: /
Disallow: /admin/
Disallow: /dashboard/
"""


def robots_txt(request):
    """robots.txt pointing to this environment's sitemap (the test site also sends X-Robots-Tag: noindex)."""
    groups = ["User-agent: *\n" + ROBOTS_RULES]
    ai_agents = "".join(f"User-agent: {bot}\n" for bot in AI_CRAWLERS)
    groups.append("# Assistentes e buscas com IA: liberados.\n" + ai_agents + ROBOTS_RULES)
    body = "\n".join(groups) + f"\nSitemap: {request.build_absolute_uri('/sitemap.xml')}\n"
    return HttpResponse(body, content_type="text/plain")


def llms_txt(request):
    """
    /llms.txt: plain-text map of the site for AI assistants (llmstxt.org), built from the same content
    as the site, so it never goes stale. Only active items.
    """
    options = dict(SiteOption.objects.filter(key__in=["seo.site_name", "seo.home.description"]).values_list("key", "value"))

    def line(title, path, summary=""):
        summary = " ".join(summary.split())  # one line, whatever line breaks the admin text has
        return f"- [{title}]({request.build_absolute_uri(path)})" + (f": {summary}" if summary else "")

    sections = [
        ("Serviços", [line(s.title, f"/servicos/{s.slug}", s.excerpt) for s in Service.objects.filter(is_active=True)]),
        ("Cases", [line(c.title, f"/cases/{c.slug}", c.excerpt) for c in Case.objects.filter(is_active=True)]),
        ("Blog", [line(p.title, f"/blog/{p.slug}", p.subtitle) for p in Post.objects.filter(is_active=True)]),
        ("Institucional", [line("Quem somos", "/quem-somos"), line("Contato", "/contato")]),
    ]
    text = f"# {options.get('seo.site_name') or 'Metricaz'}\n"
    if description := options.get("seo.home.description"):
        text += f"\n> {description}\n"
    for title, items in sections:
        if items:
            text += f"\n## {title}\n\n" + "\n".join(items) + "\n"
    return HttpResponse(text, content_type="text/plain; charset=utf-8")


# --- Session -------------------------------------------------------------------------------------

@method_decorator(ensure_csrf_cookie, name="dispatch")
class MeView(APIView):
    """
    Who is logged in (through Django's login page), or null. Read-only: it never logs anyone in.
    Also sets the CSRF cookie the dashboard sends back on writes.
    """

    permission_classes = [AllowAny]

    def get(self, request):
        user = request.user
        if not is_staff(user):
            return Response({"user": None})
        return Response({"user": {"id": user.pk, "username": user.get_username(), "email": user.email}})


# --- Content ------------------------------------------------------------------------------------

class OrderedViewSet(viewsets.ModelViewSet):
    """
    Public reads only see active items, by position. Staff (dashboard) sees and edits everything.

    Query params:
      ?placement=<name>  items flagged for that place (see `placements`)
      ?slug=<slug>       services / cases / pages by URL slug
      ?limit=<n>         first n items
    """

    parser_classes = FILE_PARSERS
    placements: dict[str, str] = {}
    slug_filter = False

    def get_queryset(self):
        queryset = self.serializer_class.Meta.model.objects.all()
        if not is_staff(self.request.user):
            queryset = queryset.filter(is_active=True)

        params = self.request.query_params
        if placement := params.get("placement"):
            if placement not in self.placements:
                raise ValidationError({"placement": f"Use um de: {', '.join(self.placements)}."})
            queryset = queryset.filter(**{self.placements[placement]: True})
        if self.slug_filter and (slug := params.get("slug")):
            queryset = queryset.filter(slug=slug)
        return queryset

    def filter_queryset(self, queryset):
        queryset = super().filter_queryset(queryset)
        limit = self.request.query_params.get("limit", "")
        if self.action == "list" and limit.isdigit() and int(limit) > 0:
            queryset = queryset[: int(limit)]
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class SectorViewSet(OrderedViewSet):
    serializer_class = SectorSerializer


class CompanyViewSet(OrderedViewSet):
    serializer_class = CompanySerializer


class TeamMemberViewSet(OrderedViewSet):
    serializer_class = TeamMemberSerializer
    placements = {"home": "show_on_home", "about": "show_on_about"}


class TestimonialViewSet(OrderedViewSet):
    serializer_class = TestimonialSerializer
    placements = {
        "client_panel": "show_in_client_panel",
        "testimonials": "show_in_testimonials",
        "about": "show_on_about",
    }


class ServiceViewSet(OrderedViewSet):
    serializer_class = ServiceSerializer
    slug_filter = True

    def get_queryset(self):
        return super().get_queryset().prefetch_related("related_cases", "related_posts")


class FAQItemViewSet(OrderedViewSet):
    """Perguntas frequentes. ?service=<slug do serviço>, ou ?service=home para as da home (sem serviço)."""

    serializer_class = FAQItemSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        service = self.request.query_params.get("service")
        if service == "home":
            queryset = queryset.filter(service__isnull=True)
        elif service:
            queryset = queryset.filter(service__slug=service)
        return queryset


class CaseViewSet(OrderedViewSet):
    serializer_class = CaseSerializer
    slug_filter = True


class PageViewSet(OrderedViewSet):
    serializer_class = PageSerializer
    slug_filter = True


class CompanyAddressViewSet(OrderedViewSet):
    """The site shows the first active address (?limit=1)."""

    serializer_class = CompanyAddressSerializer


class MethodStepViewSet(OrderedViewSet):
    serializer_class = MethodStepSerializer


class EngagementModelViewSet(OrderedViewSet):
    serializer_class = EngagementModelSerializer


class AboutPillarViewSet(OrderedViewSet):
    serializer_class = AboutPillarSerializer


class AboutHighlightViewSet(OrderedViewSet):
    serializer_class = AboutHighlightSerializer


class SocialLinkViewSet(OrderedViewSet):
    serializer_class = SocialLinkSerializer


class PostViewSet(OrderedViewSet):
    """Blog posts, newest first. Extra filters: ?tag=<tag slug>, ?author=<author slug>."""

    serializer_class = PostSerializer
    slug_filter = True

    def get_queryset(self):
        queryset = super().get_queryset().select_related("author", "tag")
        if tag := self.request.query_params.get("tag"):
            queryset = queryset.filter(tag__slug=tag)
        if author := self.request.query_params.get("author"):
            queryset = queryset.filter(author__slug=author)
        return queryset


class SlugFilterMixin:
    """?slug=<slug> narrows the list to that item (author and category pages)."""

    def get_queryset(self):
        queryset = super().get_queryset()
        if slug := self.request.query_params.get("slug"):
            queryset = queryset.filter(slug=slug)
        return queryset


class AuthorViewSet(SlugFilterMixin, viewsets.ModelViewSet):
    queryset = Author.objects.all()
    serializer_class = AuthorSerializer
    parser_classes = FILE_PARSERS


class TagViewSet(SlugFilterMixin, viewsets.ModelViewSet):
    queryset = Tag.objects.all()
    serializer_class = TagSerializer


class SiteImageViewSet(viewsets.ModelViewSet):
    """Single site images by key (like options)."""

    queryset = SiteImage.objects.all()
    serializer_class = SiteImageSerializer
    lookup_field = "key"
    lookup_value_regex = r"[a-z0-9_.]+"
    parser_classes = FILE_PARSERS


class SiteOptionViewSet(viewsets.ModelViewSet):
    """Loose values by key. Public reads skip empty values (empty = not shown)."""

    serializer_class = SiteOptionSerializer
    lookup_field = "key"
    lookup_value_regex = r"[a-z0-9_.]+"

    def get_queryset(self):
        queryset = SiteOption.objects.all()
        if not is_staff(self.request.user):
            queryset = queryset.exclude(value="")
        return queryset


class ContentImageViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Rich-text uploads (dashboard only). Reference the returned id as <img data-image-id="ID">."""

    queryset = ContentImage.objects.all()
    serializer_class = ContentImageSerializer
    permission_classes = [IsStaff]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


# --- Single-row settings ------------------------------------------------------------------------

class SingletonView(APIView):
    model = None
    serializer_class = None

    def get(self, request):
        return Response(self.serializer_class(self.model.load()).data)

    def put(self, request):
        serializer = self.serializer_class(self.model.load(), data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    patch = put


class WhatsAppSettingsView(SingletonView):
    """Public read (the site's button), staff write."""

    model = WhatsAppSettings
    serializer_class = WhatsAppSettingsSerializer


# --- Received from visitors ---------------------------------------------------------------------

class PublicCreateStaffReadViewSet(
    mixins.CreateModelMixin, mixins.ListModelMixin, mixins.RetrieveModelMixin, mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """Visitors can only POST (throttled) and get back the new id; staff can list, read and delete."""

    throttle_scope = "public_forms"

    def get_permissions(self):
        return [AllowAny()] if self.action == "create" else [IsStaff()]

    def get_throttles(self):
        return [ScopedRateThrottle()] if self.action == "create" else []

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        instance = self.save_new(serializer)
        return Response({"id": instance.pk}, status=status.HTTP_201_CREATED)

    def save_new(self, serializer):
        return serializer.save()


class ContactSubmissionViewSet(PublicCreateStaffReadViewSet):
    """Only saved here (status "queued"); sending through SendGrid is a separate step."""

    queryset = ContactSubmission.objects.all()
    serializer_class = ContactSubmissionSerializer

    def save_new(self, serializer):
        payload = self.request.data.dict() if hasattr(self.request.data, "dict") else dict(self.request.data)
        return serializer.save(payload=payload)


class NewsletterSubscriberViewSet(PublicCreateStaffReadViewSet):
    queryset = NewsletterSubscriber.objects.all()
    serializer_class = NewsletterSubscriberSerializer

    def save_new(self, serializer):
        # Subscribing an e-mail that is already on the list just returns the existing record.
        subscriber, _ = NewsletterSubscriber.objects.get_or_create(
            email=serializer.validated_data["email"].lower(),
            defaults={"source_page": serializer.validated_data.get("source_page", "")},
        )
        return subscriber


class LeadViewSet(PublicCreateStaffReadViewSet):
    queryset = Lead.objects.all()
    serializer_class = LeadSerializer


class WhatsAppClickViewSet(PublicCreateStaffReadViewSet):
    """?since=<ISO datetime> filters the staff listing (analytics panel)."""

    queryset = WhatsAppClick.objects.all()
    serializer_class = WhatsAppClickSerializer
    throttle_scope = "whatsapp_clicks"

    def get_queryset(self):
        queryset = super().get_queryset()
        if since := parse_datetime(self.request.query_params.get("since", "")):
            queryset = queryset.filter(clicked_at__gte=since)
        return queryset
