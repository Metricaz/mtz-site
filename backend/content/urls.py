from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("sectors", views.SectorViewSet, basename="sector")
router.register("companies", views.CompanyViewSet, basename="company")
router.register("team", views.TeamMemberViewSet, basename="team-member")
router.register("testimonials", views.TestimonialViewSet, basename="testimonial")
router.register("services", views.ServiceViewSet, basename="service")
router.register("cases", views.CaseViewSet, basename="case")
router.register("addresses", views.CompanyAddressViewSet, basename="company-address")
router.register("options", views.SiteOptionViewSet, basename="site-option")
router.register("content-images", views.ContentImageViewSet, basename="content-image")
router.register("contact-submissions", views.ContactSubmissionViewSet, basename="contact-submission")
router.register("newsletter", views.NewsletterSubscriberViewSet, basename="newsletter-subscriber")
router.register("leads", views.LeadViewSet, basename="lead")
router.register("whatsapp-clicks", views.WhatsAppClickViewSet, basename="whatsapp-click")

urlpatterns = [
    path("whatsapp-settings/", views.WhatsAppSettingsView.as_view(), name="whatsapp-settings"),
    path("contact-settings/", views.ContactSettingsView.as_view(), name="contact-settings"),
    path("", include(router.urls)),
]
