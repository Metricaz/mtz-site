from rest_framework import serializers

from . import rich_text
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
        fields = ["key", "value", "description", "updated_at"]
        read_only_fields = ["updated_at"]


class WhatsAppSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = WhatsAppSettings
        fields = ["number", "enabled", "message", "updated_at"]
        read_only_fields = ["updated_at"]


class ContactSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSettings
        fields = ["recipient_email", "sender_email", "sender_name", "updated_at"]
        read_only_fields = ["updated_at"]


# --- Received from visitors ---------------------------------------------------------------------

class ContactSubmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactSubmission
        fields = "__all__"
        read_only_fields = [
            "id", "status", "email_message_id", "error_message", "payload", "created_at", "updated_at",
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
