from rest_framework import serializers

from . import rich_text
from .models import (
    AboutHighlight,
    AboutPillar,
    Author,
    Capability,
    Case,
    Company,
    CompanyAddress,
    ContactSubmission,
    ContentImage,
    EngagementModel,
    Lead,
    MethodStep,
    NewsletterSubscriber,
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

ORDERED_READ_ONLY = ("id", "created_by", "created_at", "updated_at")


class OrderedSerializer(serializers.ModelSerializer):
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)


class RichTextMixin:
    """content_html: stored with <img data-image-id>, served with the image URLs filled in."""

    def validate_content_html(self, value):
        html, missing = rich_text.normalize(value)
        if missing:
            raise serializers.ValidationError(f"Imagem inexistente: {', '.join(map(str, sorted(missing)))}.")
        return html

    def to_representation(self, instance):
        data = super().to_representation(instance)
        request = self.context.get("request")
        build_url = request.build_absolute_uri if request else (lambda url: url)
        data["content_html"] = rich_text.resolve(data["content_html"], build_url)
        return data


class SectorSerializer(OrderedSerializer):
    class Meta:
        model = Sector
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class CompanySerializer(OrderedSerializer):
    class Meta:
        model = Company
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class TeamMemberSerializer(OrderedSerializer):
    class Meta:
        model = TeamMember
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class TestimonialSerializer(OrderedSerializer):
    class Meta:
        model = Testimonial
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class ServiceSerializer(RichTextMixin, OrderedSerializer):
    class Meta:
        model = Service
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class CaseSerializer(RichTextMixin, OrderedSerializer):
    class Meta:
        model = Case
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class CompanyAddressSerializer(OrderedSerializer):
    class Meta:
        model = CompanyAddress
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class ContentImageSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = ContentImage
        fields = ["id", "image", "uploaded_by", "uploaded_at"]
        read_only_fields = ["id", "uploaded_by", "uploaded_at"]


class SiteOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteOption
        fields = ["key", "label", "value", "description", "updated_at"]
        read_only_fields = ["updated_at"]


class SiteImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteImage
        fields = ["key", "image", "alt", "description", "updated_at"]
        read_only_fields = ["updated_at"]


class MethodStepSerializer(OrderedSerializer):
    class Meta:
        model = MethodStep
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class EngagementModelSerializer(OrderedSerializer):
    class Meta:
        model = EngagementModel
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class CapabilitySerializer(OrderedSerializer):
    class Meta:
        model = Capability
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class AboutPillarSerializer(OrderedSerializer):
    class Meta:
        model = AboutPillar
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class AboutHighlightSerializer(OrderedSerializer):
    class Meta:
        model = AboutHighlight
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


class SocialLinkSerializer(OrderedSerializer):
    class Meta:
        model = SocialLink
        fields = "__all__"
        read_only_fields = ORDERED_READ_ONLY


# --- Blog ---------------------------------------------------------------------------------------

class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Author
        fields = ["id", "name", "mini_bio"]


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ["id", "name", "slug"]


class PostSerializer(RichTextMixin, serializers.ModelSerializer):
    """Author and tag come nested on reads; writes take their ids (author_id, tag_id)."""

    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    author = AuthorSerializer(read_only=True)
    tag = TagSerializer(read_only=True)
    author_id = serializers.PrimaryKeyRelatedField(
        source="author", queryset=Author.objects.all(), write_only=True, required=False, allow_null=True
    )
    tag_id = serializers.PrimaryKeyRelatedField(
        source="tag", queryset=Tag.objects.all(), write_only=True, required=False, allow_null=True
    )

    class Meta:
        model = Post
        fields = [
            "id", "title", "slug", "subtitle", "author", "author_id", "tag", "tag_id",
            "featured_image", "featured_image_alt", "content_html", "published_at",
            "is_active", "created_by", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at"]


class WhatsAppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppSettings
        fields = ["number", "enabled", "message", "updated_at"]
        read_only_fields = ["updated_at"]


# --- Received from visitors ---------------------------------------------------------------------

class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = "__all__"
        read_only_fields = [
            "id", "status", "error_message", "payload", "created_at", "updated_at",
        ]


class WhatsAppClickSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppClick
        fields = "__all__"
        read_only_fields = ["id", "clicked_at"]


class NewsletterSubscriberSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterSubscriber
        fields = ["id", "email", "source_page", "created_at"]
        read_only_fields = ["id", "created_at"]
        # Subscribing twice is not an error (handled in the view), so skip the unique check here.
        extra_kwargs = {"email": {"validators": []}}


class LeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = ["id", "email", "source_page", "created_at"]
        read_only_fields = ["id", "created_at"]
