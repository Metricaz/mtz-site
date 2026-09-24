from django.contrib import admin

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


class OrderedAdmin(admin.ModelAdmin):
    """Editable content: reorder and switch on/off straight from the list; records who created it."""

    list_editable = ("order_position", "is_active")
    list_filter = ("is_active",)
    readonly_fields = ("created_by", "created_at", "updated_at")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(Sector)
class SectorAdmin(OrderedAdmin):
    list_display = ("name", "order_position", "is_active")
    search_fields = ("name",)


@admin.register(Company)
class CompanyAdmin(OrderedAdmin):
    list_display = ("name", "website_url", "order_position", "is_active")
    search_fields = ("name",)


@admin.register(TeamMember)
class TeamMemberAdmin(OrderedAdmin):
    list_display = ("name", "role", "show_on_home", "show_on_about", "order_position", "is_active")
    list_editable = ("show_on_home", "show_on_about", "order_position", "is_active")
    list_filter = ("is_active", "show_on_home", "show_on_about")
    search_fields = ("name", "role")


@admin.register(Testimonial)
class TestimonialAdmin(OrderedAdmin):
    list_display = (
        "name",
        "company",
        "show_in_client_panel",
        "show_in_testimonials",
        "show_on_about",
        "order_position",
        "is_active",
    )
    list_editable = ("show_in_client_panel", "show_in_testimonials", "show_on_about", "order_position", "is_active")
    list_filter = ("is_active", "show_in_client_panel", "show_in_testimonials", "show_on_about")
    search_fields = ("name", "company", "text")


@admin.register(Service)
class ServiceAdmin(OrderedAdmin):
    list_display = ("title", "slug", "icon_name", "order_position", "is_active")
    search_fields = ("title", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Case)
class CaseAdmin(OrderedAdmin):
    list_display = ("title", "slug", "tag", "order_position", "is_active")
    search_fields = ("title", "slug", "client_name")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(CompanyAddress)
class CompanyAddressAdmin(OrderedAdmin):
    list_display = ("label", "street", "city", "country", "order_position", "is_active")
    search_fields = ("label", "street", "city")

    def changelist_view(self, request, extra_context=None):
        extra_context = {"title": "Endereços — o site mostra só o primeiro ativo, por posição", **(extra_context or {})}
        return super().changelist_view(request, extra_context)


@admin.register(ContentImage)
class ContentImageAdmin(admin.ModelAdmin):
    list_display = ("id", "image", "uploaded_by", "uploaded_at")
    readonly_fields = ("uploaded_by", "uploaded_at")

    def save_model(self, request, obj, form, change):
        if not change:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(SiteOption)
class SiteOptionAdmin(admin.ModelAdmin):
    list_display = ("key", "value", "description")
    list_editable = ("value",)
    search_fields = ("key", "value", "description")


class SingletonAdmin(admin.ModelAdmin):
    """One row only: no add once it exists, never delete."""

    def has_add_permission(self, request):
        return not self.model.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(WhatsAppSettings)
class WhatsAppSettingsAdmin(SingletonAdmin):
    list_display = ("__str__", "number", "enabled")


@admin.register(ContactSettings)
class ContactSettingsAdmin(SingletonAdmin):
    list_display = ("__str__", "recipient_email", "sender_email")


class ReceivedAdmin(admin.ModelAdmin):
    """Data sent by visitors: read-only (can be deleted, never edited)."""

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


@admin.register(ContactSubmission)
class ContactSubmissionAdmin(ReceivedAdmin):
    list_display = ("created_at", "name", "email", "company", "status")
    list_filter = ("status",)
    search_fields = ("name", "email", "company", "message")


@admin.register(WhatsAppClick)
class WhatsAppClickAdmin(ReceivedAdmin):
    list_display = ("clicked_at", "page_path", "button_context")
    list_filter = ("button_context",)


@admin.register(NewsletterSubscriber)
class NewsletterSubscriberAdmin(ReceivedAdmin):
    list_display = ("email", "source_page", "created_at")
    search_fields = ("email",)


@admin.register(Lead)
class LeadAdmin(ReceivedAdmin):
    list_display = ("email", "source_page", "created_at")
    search_fields = ("email",)
