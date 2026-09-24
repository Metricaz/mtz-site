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
router.register("site-images", views.SiteImageViewSet, basename="site-image")
router.register("method-steps", views.MethodStepViewSet, basename="method-step")
router.register("engagement-models", views.EngagementModelViewSet, basename="engagement-model")
router.register("capabilities", views.CapabilityViewSet, basename="capability")
router.register("about-pillars", views.AboutPillarViewSet, basename="about-pillar")
router.register("about-highlights", views.AboutHighlightViewSet, basename="about-highlight")
router.register("social-links", views.SocialLinkViewSet, basename="social-link")
router.register("authors", views.AuthorViewSet, basename="author")
router.register("tags", views.TagViewSet, basename="tag")
router.register("posts", views.PostViewSet, basename="post")
router.register("content-images", views.ContentImageViewSet, basename="content-image")
router.register("contact-submissions", views.ContactSubmissionViewSet, basename="contact-submission")
router.register("newsletter", views.NewsletterSubscriberViewSet, basename="newsletter-subscriber")
router.register("leads", views.LeadViewSet, basename="lead")
router.register("whatsapp-clicks", views.WhatsAppClickViewSet, basename="whatsapp-click")

urlpatterns = [
    path("auth/me/", views.MeView.as_view(), name="auth-me"),
    path("whatsapp-settings/", views.WhatsAppSettingsView.as_view(), name="whatsapp-settings"),
    path("contact-settings/", views.ContactSettingsView.as_view(), name="contact-settings"),
    path("", include(router.urls)),
]
