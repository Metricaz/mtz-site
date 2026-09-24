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
    Case,
    Company,
    CompanyAddress,
    ContactSettings,
    ContactSubmission,
    ContentImage,
    Lead,
    NewsletterSubscriber,
    Sector,
    Service,
    SiteOption,
    TeamMember,
    Testimonial,
    WhatsAppClick,
    WhatsAppSettings,
)
from .permissions import IsStaff, is_staff
from .serializers import (
    CaseSerializer,
    CompanyAddressSerializer,
    CompanySerializer,
    ContactSettingsSerializer,
    ContactSubmissionSerializer,
    ContentImageSerializer,
    LeadSerializer,
    NewsletterSubscriberSerializer,
    SectorSerializer,
    ServiceSerializer,
    SiteOptionSerializer,
    TeamMemberSerializer,
    TestimonialSerializer,
    WhatsAppClickSerializer,
    WhatsAppSettingsSerializer,
)

FILE_PARSERS = [JSONParser, MultiPartParser, FormParser]


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
      ?slug=<slug>       services / cases by URL slug
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


class CaseViewSet(OrderedViewSet):
    serializer_class = CaseSerializer
    slug_filter = True


class CompanyAddressViewSet(OrderedViewSet):
    """The site shows the first active address (?limit=1)."""

    serializer_class = CompanyAddressSerializer


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


class ContactSettingsView(SingletonView):
    """Staff only: e-mail addresses used to send the contact form are not public."""

    model = ContactSettings
    serializer_class = ContactSettingsSerializer
    permission_classes = [IsStaff]


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
