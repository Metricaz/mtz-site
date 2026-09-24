from django.test import TestCase

from .models import (
    CompanyAddress,
    Company,
    ContactSettings,
    Sector,
    Service,
    SiteOption,
    TeamMember,
    Testimonial,
    WhatsAppSettings,
)


class InitialContentFixtureTests(TestCase):
    fixtures = ["initial_content"]

    def test_counts(self):
        self.assertEqual(Sector.objects.count(), 10)
        self.assertEqual(Company.objects.count(), 8)
        self.assertEqual(TeamMember.objects.count(), 8)
        self.assertEqual(Testimonial.objects.count(), 3)
        self.assertEqual(Service.objects.count(), 4)
        self.assertEqual(CompanyAddress.objects.count(), 2)

    def test_team_flags(self):
        self.assertEqual(TeamMember.objects.filter(show_on_home=True).count(), 8)
        self.assertEqual(TeamMember.objects.filter(show_on_about=True).count(), 3)

    def test_testimonial_flags(self):
        self.assertEqual(Testimonial.objects.filter(show_in_client_panel=True).count(), 3)
        self.assertEqual(Testimonial.objects.filter(show_in_testimonials=True).count(), 3)
        self.assertEqual(list(Testimonial.objects.filter(show_on_about=True).values_list("name", flat=True)), ["Marina Costa"])

    def test_first_address_is_sao_paulo(self):
        first = CompanyAddress.objects.filter(is_active=True).first()
        self.assertEqual((first.label, first.postal_code), ("São Paulo", "05408-003"))

    def test_options_and_settings(self):
        self.assertEqual(SiteOption.objects.get(key="contact.email").value, "comercial@metricaz.com")
        self.assertEqual(SiteOption.objects.get(key="logos.brands_count").value, "+80")
        contact = ContactSettings.load()
        self.assertEqual((contact.recipient_email, contact.sender_email), ("comercial@metricaz.com", "contato@metricaz.com"))
        self.assertTrue(WhatsAppSettings.load().message)

    def test_every_record_passes_model_validation(self):
        for model in (Sector, Company, TeamMember, Testimonial, Service, CompanyAddress, SiteOption):
            for obj in model.objects.all():
                obj.full_clean()
