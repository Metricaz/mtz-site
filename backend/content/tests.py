import io
import tempfile
from unittest import mock
from pathlib import Path

from django.apps import apps
from django.contrib.auth.models import User
from django.core import mail
from django.core.cache import cache
from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import CommandError, call_command
from django.test import Client, TestCase, override_settings
from django.urls import reverse
from PIL import Image
from rest_framework.test import APIClient

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
    WhatsAppSettings,
)
from .sanitize import sanitize_html


class InitialContentFixtureTests(TestCase):
    fixtures = ["initial_content"]

    def test_counts(self):
        self.assertEqual(Sector.objects.count(), 10)
        self.assertEqual(Company.objects.count(), 8)
        self.assertEqual(TeamMember.objects.count(), 8)
        self.assertEqual(Testimonial.objects.count(), 3)
        self.assertEqual(Service.objects.count(), 4)
        self.assertEqual(CompanyAddress.objects.count(), 2)
        self.assertEqual(MethodStep.objects.count(), 4)
        self.assertEqual(EngagementModel.objects.count(), 3)
        self.assertEqual(Capability.objects.count(), 6)
        self.assertEqual(AboutPillar.objects.count(), 3)
        self.assertEqual(AboutHighlight.objects.count(), 4)
        self.assertEqual(SocialLink.objects.count(), 3)
        self.assertEqual(SiteImage.objects.get().key, "about.why_image")
        self.assertEqual(Tag.objects.count(), 5)
        self.assertEqual(Case.objects.get().slug, "case-de-exemplo")

    def test_example_post_is_complete(self):
        post = Post.objects.get()
        self.assertEqual((post.author.name, post.tag.name), ("Nome Sobrenome", "Privacidade"))
        self.assertTrue(post.subtitle and post.featured_image and post.content_html)

    def test_fixture_images_exist(self):
        media = Path(__file__).parent / "fixtures" / "media"
        paths = [p.image.name for p in AboutPillar.objects.all()] + [
            SiteImage.objects.get().image.name,
            Post.objects.get().featured_image.name,
            Case.objects.get().featured_image.name,
        ]
        for name in paths:
            self.assertTrue((media / name).is_file(), name)

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
        self.assertEqual(SiteOption.objects.get(key="marcasatendidas").value, "80")
        self.assertEqual(SiteOption.objects.get(key="receitaorganica").label, "Receita orgânica média")
        self.assertEqual(SiteOption.objects.get(key="hero.title").value, "Dados que viram\n*vantagem* competitiva.")
        self.assertFalse(SiteOption.objects.filter(key="logos.brands_count").exists())
        self.assertTrue(WhatsAppSettings.load().message)

    def test_every_record_passes_model_validation(self):
        for model in (
            Sector, Company, TeamMember, Testimonial, Service, Case, CompanyAddress, SiteOption, SiteImage,
            MethodStep, EngagementModel, Capability, AboutPillar, AboutHighlight, SocialLink, Author, Tag, Post,
        ):
            for obj in model.objects.all():
                obj.full_clean()


def png(name="foto.png"):
    buffer = io.BytesIO()
    Image.new("RGB", (4, 4), "orange").save(buffer, format="PNG")
    return SimpleUploadedFile(name, buffer.getvalue(), content_type="image/png")


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class ApiTestCase(TestCase):
    def setUp(self):
        cache.clear()  # throttling counters
        self.client = APIClient(enforce_csrf_checks=True)
        self.staff = User.objects.create_user("admin", password="senha-forte-123", is_staff=True)

    def login(self):
        """Session login + a CSRF cookie/header pair, like the dashboard will send."""
        self.client.force_login(self.staff)
        self.client.cookies["csrftoken"] = "x" * 32
        self.csrf = {"HTTP_X_CSRFTOKEN": "x" * 32}


class PublicContentApiTests(ApiTestCase):
    def test_public_sees_only_active_by_position(self):
        Sector.objects.create(name="B", order_position=2)
        Sector.objects.create(name="A", order_position=1)
        Sector.objects.create(name="Oculto", order_position=0, is_active=False)
        self.assertEqual([s["name"] for s in self.client.get("/api/sectors/").json()], ["A", "B"])

    def test_staff_also_sees_inactive(self):
        Sector.objects.create(name="Oculto", is_active=False)
        self.login()
        self.assertEqual([s["name"] for s in self.client.get("/api/sectors/").json()], ["Oculto"])

    def test_team_placement(self):
        TeamMember.objects.create(name="Home", role="r", show_on_home=True, show_on_about=False)
        TeamMember.objects.create(name="Ambos", role="r", show_on_home=True, show_on_about=True)
        names = lambda p: [m["name"] for m in self.client.get(f"/api/team/?placement={p}").json()]
        self.assertEqual(names("home"), ["Home", "Ambos"])
        self.assertEqual(names("about"), ["Ambos"])
        self.assertEqual(self.client.get("/api/team/?placement=nope").status_code, 400)

    def test_testimonial_placement(self):
        Testimonial.objects.create(name="Painel", role="r", company="c", text="t", show_in_client_panel=True, show_in_testimonials=False)
        Testimonial.objects.create(name="Sobre", role="r", company="c", text="t", show_in_testimonials=False, show_on_about=True)
        get = lambda p: [t["name"] for t in self.client.get(f"/api/testimonials/?placement={p}").json()]
        self.assertEqual(get("client_panel"), ["Painel"])
        self.assertEqual(get("about"), ["Sobre"])
        self.assertEqual(get("testimonials"), [])

    def test_slug_and_limit(self):
        for i in range(3):
            Service.objects.create(title=f"S{i}", slug=f"s{i}", icon_name="seo", excerpt="e", content_html="<p>x</p>", order_position=i)
        self.assertEqual(len(self.client.get("/api/services/?limit=2").json()), 2)
        self.assertEqual([s["slug"] for s in self.client.get("/api/services/?slug=s1").json()], ["s1"])
        self.assertEqual(self.client.get("/api/services/?slug=nope").json(), [])

    def test_first_address(self):
        CompanyAddress.objects.create(label="Orlando", street="x", city="Orlando", state="FL", country="US", order_position=2)
        CompanyAddress.objects.create(label="São Paulo", street="x", city="SP", state="SP", country="Brasil", order_position=1)
        self.assertEqual([a["label"] for a in self.client.get("/api/addresses/?limit=1").json()], ["São Paulo"])

    def test_options_skip_empty_for_public(self):
        SiteOption.objects.create(key="contact.email", value="comercial@metricaz.com")
        SiteOption.objects.create(key="logos.brands_count", value="")
        data = self.client.get("/api/options/").json()
        self.assertEqual([(o["key"], o["value"]) for o in data], [("contact.email", "comercial@metricaz.com")])
        self.assertEqual(self.client.get("/api/options/contact.email/").json()["value"], "comercial@metricaz.com")

    def test_whatsapp_settings_are_public(self):
        self.assertEqual(self.client.get("/api/whatsapp-settings/").status_code, 200)


class StaffWriteApiTests(ApiTestCase):
    def test_anonymous_cannot_write(self):
        response = self.client.post("/api/sectors/", {"name": "x"}, format="json")
        self.assertEqual(response.status_code, 403)
        self.assertFalse(Sector.objects.exists())

    def test_staff_write_requires_csrf(self):
        self.client.force_login(self.staff)
        self.assertEqual(self.client.post("/api/sectors/", {"name": "x"}, format="json").status_code, 403)

    def test_non_staff_user_cannot_write(self):
        self.client.force_login(User.objects.create_user("visitante", password="x"))
        self.client.cookies["csrftoken"] = "x" * 32
        response = self.client.post("/api/sectors/", {"name": "x"}, format="json", HTTP_X_CSRFTOKEN="x" * 32)
        self.assertEqual(response.status_code, 403)

    def test_staff_crud_sets_created_by(self):
        self.login()
        response = self.client.post("/api/sectors/", {"name": "Varejo"}, format="json", **self.csrf)
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json()["created_by"], self.staff.pk)
        sector_id = response.json()["id"]
        self.client.patch(f"/api/sectors/{sector_id}/", {"is_active": False}, format="json", **self.csrf)
        self.assertFalse(Sector.objects.get(pk=sector_id).is_active)
        self.assertEqual(self.client.delete(f"/api/sectors/{sector_id}/", **self.csrf).status_code, 204)

    def test_image_upload_on_model(self):
        self.login()
        response = self.client.post("/api/companies/", {"name": "ACME", "logo": png()}, format="multipart", **self.csrf)
        self.assertEqual(response.status_code, 201, response.content)
        self.assertTrue(response.json()["logo"].startswith("/media/companies/"))  # relative, whatever the host

    def test_whatsapp_settings_update(self):
        self.login()
        response = self.client.put("/api/whatsapp-settings/", {"number": "5511999999999"}, format="json", **self.csrf)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(WhatsAppSettings.load().number, "5511999999999")


class RichTextApiTests(ApiTestCase):
    def service(self, html):
        return self.client.post(
            "/api/services/",
            {"title": "SEO", "slug": "seo", "icon_name": "seo", "excerpt": "e", "content_html": html},
            format="json",
            **self.csrf,
        )

    def test_upload_then_reference_by_id(self):
        self.login()
        upload = self.client.post("/api/content-images/", {"image": png()}, format="multipart", **self.csrf)
        self.assertEqual(upload.status_code, 201, upload.content)
        image_id = upload.json()["id"]
        self.assertEqual(ContentImage.objects.get(pk=image_id).uploaded_by, self.staff)

        # the editor may send the src back; only the reference is stored
        response = self.service(f'<p>a</p><img src="http://old/x.png" data-image-id="{image_id}" alt="x">')
        self.assertEqual(response.status_code, 201, response.content)
        stored = Service.objects.get().content_html
        self.assertEqual(stored, f'<p>a</p><img data-image-id="{image_id}" alt="x">')

        served = self.client.get("/api/services/").json()[0]["content_html"]
        self.assertIn(f'<img src="/media/content/', served)
        self.assertIn('width="4" height="4"', served)  # aspect ratio for the browser (avoids layout shift)
        self.assertIn(f'data-image-id="{image_id}"', served)

    def test_editor_sent_size_is_not_stored(self):
        self.login()
        image_id = self.client.post("/api/content-images/", {"image": png()}, format="multipart", **self.csrf).json()["id"]
        self.service(f'<img data-image-id="{image_id}" width="999" height="1">')
        self.assertEqual(Service.objects.get().content_html, f'<img data-image-id="{image_id}">')
        self.assertIn('width="4" height="4"', self.client.get("/api/services/").json()[0]["content_html"])

    def test_unknown_image_id_is_rejected(self):
        self.login()
        self.assertEqual(self.service('<img data-image-id="999">').status_code, 400)

    def test_deleted_image_disappears_from_html(self):
        image = ContentImage.objects.create(image=png())
        Service.objects.create(title="S", slug="s", icon_name="seo", excerpt="e", content_html=f'<p>a</p><img data-image-id="{image.pk}">')
        image.delete()
        self.assertEqual(self.client.get("/api/services/").json()[0]["content_html"], "<p>a</p>")

    def test_content_images_are_staff_only(self):
        self.assertEqual(self.client.get("/api/content-images/").status_code, 403)


class ReceivedApiTests(ApiTestCase):
    def test_contact_submission_saved_as_queued_returns_only_id(self):
        payload = {"name": "Ana", "email": "ana@acme.com", "message": "Olá", "source_page": "/contato", "extra": "x"}
        response = self.client.post("/api/contact-submissions/", payload, format="json")
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(list(response.json()), ["id"])
        submission = ContactSubmission.objects.get()
        self.assertEqual(submission.status, "queued")
        self.assertEqual(submission.payload["extra"], "x")

    def test_contact_submission_requires_fields(self):
        response = self.client.post("/api/contact-submissions/", {"name": "Ana"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_received_data_is_staff_only_to_read(self):
        for url in ("/api/contact-submissions/", "/api/newsletter/", "/api/leads/", "/api/whatsapp-clicks/"):
            self.assertEqual(self.client.get(url).status_code, 403, url)

    def test_newsletter_is_idempotent(self):
        for _ in range(2):
            response = self.client.post("/api/newsletter/", {"email": "Ana@Acme.com"}, format="json")
            self.assertEqual(response.status_code, 201)
        self.assertEqual(list(NewsletterSubscriber.objects.values_list("email", flat=True)), ["ana@acme.com"])

    def test_lead(self):
        self.assertEqual(self.client.post("/api/leads/", {"email": "a@b.com", "source_page": "/"}, format="json").status_code, 201)
        self.assertEqual(Lead.objects.get().source_page, "/")

    def test_whatsapp_click_and_since_filter(self):
        body = {"page_path": "/", "button_context": "floating"}
        self.assertEqual(self.client.post("/api/whatsapp-clicks/", body, format="json").status_code, 201)
        self.login()
        self.assertEqual(len(self.client.get("/api/whatsapp-clicks/").json()), 1)
        self.assertEqual(self.client.get("/api/whatsapp-clicks/?since=2999-01-01T00:00:00Z").json(), [])

    def test_public_forms_are_throttled(self):
        codes = [self.client.post("/api/leads/", {"email": f"a{i}@b.com"}, format="json").status_code for i in range(11)]
        self.assertEqual(codes[-1], 429)


class SanitizeTests(TestCase):
    def test_dangerous_markup_is_removed(self):
        html = sanitize_html(
            '<h2 onclick="x()">Oi</h2><script>alert(1)</script><style>p{}</style>'
            '<p style="color:red">t<iframe src="https://evil"></iframe></p>'
            '<a href="javascript:alert(1)">x</a><img src="x" onerror="alert(1)">'
        )
        for bad in ("onclick", "script", "alert", "style", "iframe", "javascript", "onerror"):
            self.assertNotIn(bad, html)
        self.assertIn("<h2>Oi</h2>", html)

    def test_editor_markup_is_kept(self):
        html = (
            '<h2>T</h2><h3>S</h3><p><strong>b</strong> <em>i</em> <u>u</u> <s>s</s> <code>c</code><br></p>'
            '<blockquote><p>q</p></blockquote><ul><li>a</li></ul><ol start="3"><li>b</li></ol><hr>'
            '<img data-image-id="7" alt="foto">'
        )
        self.assertEqual(sanitize_html(html), html)

    def test_links_get_safe_rel(self):
        self.assertEqual(
            sanitize_html('<a href="https://metricaz.com" target="_blank">m</a>'),
            '<a href="https://metricaz.com" target="_blank" rel="noopener noreferrer">m</a>',
        )

    def test_model_save_sanitizes_every_path(self):
        service = Service.objects.create(
            title="S", slug="s", icon_name="seo", excerpt="e", content_html="<p>ok</p><script>x()</script>"
        )
        self.assertEqual(Service.objects.get(pk=service.pk).content_html, "<p>ok</p>")

    def test_fixture_content_survives_sanitizing(self):
        call_command("loaddata", "initial_content", verbosity=0)
        for obj in [*Service.objects.all(), *Post.objects.all(), *Case.objects.all()]:
            self.assertEqual(sanitize_html(obj.content_html), obj.content_html, obj.slug)


class SanitizeApiTests(ApiTestCase):
    def test_api_returns_sanitized_html(self):
        self.login()
        response = self.client.post(
            "/api/cases/",
            {
                "title": "C", "slug": "c", "tag": "t", "excerpt": "e", "kpi_value": "+1", "kpi_label": "l",
                "featured_image": png(), "content_html": '<p onclick="x()">a</p><script>b()</script>',
            },
            format="multipart",
            **self.csrf,
        )
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(response.json()["content_html"], "<p>a</p>")


class DjangoLoginTests(TestCase):
    """Login is 100% Django (LoginView/LogoutView); the API only reads the session."""

    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.staff = User.objects.create_user("admin", password="senha-forte-123", is_staff=True)

    def post_login(self, username="admin", password="senha-forte-123", **extra):
        self.client.get("/dashboard/login/")
        return self.client.post(
            "/dashboard/login/",
            {"username": username, "password": password, "csrfmiddlewaretoken": self.client.cookies["csrftoken"].value, **extra},
        )

    def me(self):
        return self.client.get("/api/auth/me/").json()["user"]

    def test_login_page_uses_our_template(self):
        response = self.client.get("/dashboard/login/?next=/dashboard/cases")
        self.assertTemplateUsed(response, "registration/login.html")
        self.assertContains(response, 'name="username"')
        self.assertContains(response, 'value="/dashboard/cases"')

    def test_me_logged_out_sets_csrf_cookie(self):
        response = self.client.get("/api/auth/me/")
        self.assertEqual(response.json(), {"user": None})
        self.assertIn("csrftoken", response.cookies)

    def test_login_redirects_and_me_reads_session(self):
        response = self.post_login()
        self.assertRedirects(response, "/dashboard", fetch_redirect_response=False)
        self.assertEqual(self.me(), {"id": self.staff.pk, "username": "admin", "email": ""})

    def test_login_honours_next(self):
        response = self.post_login(next="/dashboard/cases")
        self.assertRedirects(response, "/dashboard/cases", fetch_redirect_response=False)

    def test_wrong_password_shows_django_error(self):
        response = self.post_login(password="errada")
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.context["form"].non_field_errors())
        self.assertIsNone(self.me())

    def test_login_requires_csrf(self):
        response = self.client.post("/dashboard/login/", {"username": "admin", "password": "senha-forte-123"})
        self.assertEqual(response.status_code, 403)

    def test_logout(self):
        self.post_login()
        response = self.client.post("/dashboard/logout/", {"csrfmiddlewaretoken": self.client.cookies["csrftoken"].value})
        self.assertRedirects(response, "/dashboard/login/", fetch_redirect_response=False)
        self.assertIsNone(self.me())

    def test_non_staff_is_logged_in_by_django_but_not_a_dashboard_user(self):
        User.objects.create_user("visitante", password="senha-forte-123")
        self.post_login("visitante")
        self.assertIsNone(self.me())
        self.assertEqual(self.client.get("/api/contact-submissions/").status_code, 403)


class AdminPagesTests(TestCase):
    def test_every_content_admin_page_opens(self):
        self.client.force_login(User.objects.create_superuser("root", password="x"))
        for model in apps.get_app_config("content").get_models():
            name = model._meta.model_name
            for view in ("changelist", "add"):
                response = self.client.get(reverse(f"admin:content_{name}_{view}"))
                # received data (contact, clicks, newsletter, leads) is read-only: no "add" page
                self.assertIn(response.status_code, (200, 403), f"{name} {view}")


class BlogModelTests(TestCase):
    def test_post_content_is_sanitized_and_listed_newest_first(self):
        author = Author.objects.create(name="Nome Sobrenome")
        tag = Tag.objects.create(name="SEO", slug="seo")
        common = {"author": author, "tag": tag, "featured_image": "blog/x.png"}
        Post.objects.create(title="Antigo", slug="antigo", content_html="<p>a</p>", published_at="2026-01-01", **common)
        post = Post.objects.create(
            title="Novo", slug="novo", content_html='<p onclick="x()">b</p><script>c()</script>', published_at="2026-05-01", **common
        )
        self.assertEqual(Post.objects.get(pk=post.pk).content_html, "<p>b</p>")
        self.assertEqual(list(Post.objects.values_list("slug", flat=True)), ["novo", "antigo"])
        self.assertEqual(list(tag.posts.values_list("slug", flat=True)), ["novo", "antigo"])


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class SiteContentApiTests(ApiTestCase):
    fixtures = ["initial_content"]

    def test_lists_are_public_and_ordered(self):
        self.assertEqual([s["title"] for s in self.client.get("/api/method-steps/").json()],
                         ["Diagnóstico", "Estratégia", "Execução", "Mensuração"])
        self.assertEqual(len(self.client.get("/api/engagement-models/").json()), 3)
        self.assertEqual([c["icon_name"] for c in self.client.get("/api/capabilities/").json()][:2], ["seo", "cro"])
        self.assertEqual(len(self.client.get("/api/about-pillars/").json()), 3)
        self.assertEqual(len(self.client.get("/api/about-highlights/").json()), 4)
        links = self.client.get("/api/social-links/").json()
        self.assertEqual(links[0]["url"], "https://br.linkedin.com/company/metricaz")

    def test_inactive_items_are_hidden_from_the_public(self):
        MethodStep.objects.filter(title="Execução").update(is_active=False)
        self.assertEqual(len(self.client.get("/api/method-steps/").json()), 3)
        self.login()
        self.assertEqual(len(self.client.get("/api/method-steps/").json()), 4)

    def test_options_include_label(self):
        option = self.client.get("/api/options/receitaorganica/").json()
        self.assertEqual((option["value"], option["label"]), ("312", "Receita orgânica média"))

    def test_site_image_by_key(self):
        image = self.client.get("/api/site-images/about.why_image/").json()
        self.assertEqual(image["image"], "/media/site/por-que-escolher.webp")
        self.assertEqual(image["alt"], "Metricaz")


@override_settings(MEDIA_ROOT=tempfile.mkdtemp())
class BlogApiTests(ApiTestCase):
    fixtures = ["initial_content"]

    def test_post_comes_with_author_and_tag(self):
        post = self.client.get("/api/posts/?slug=google-consent-mode-v2").json()[0]
        self.assertEqual(post["author"]["name"], "Nome Sobrenome")
        self.assertIn("mini_bio", post["author"])
        self.assertEqual(post["tag"], {"id": 1, "name": "Privacidade", "slug": "privacidade"})
        self.assertNotIn("author_id", post)

    def test_filters_and_order(self):
        Post.objects.create(
            title="Mais novo", slug="mais-novo", tag=Tag.objects.get(slug="seo"), featured_image="blog/x.png",
            content_html="<p>x</p>", published_at="2026-09-01",
        )
        self.assertEqual([p["slug"] for p in self.client.get("/api/posts/").json()], ["mais-novo", "google-consent-mode-v2"])
        self.assertEqual([p["slug"] for p in self.client.get("/api/posts/?tag=seo").json()], ["mais-novo"])
        self.assertEqual(len(self.client.get("/api/posts/?limit=1").json()), 1)

    def test_unpublished_post_is_hidden(self):
        Post.objects.update(is_active=False)
        self.assertEqual(self.client.get("/api/posts/").json(), [])

    def test_staff_creates_post_with_ids(self):
        self.login()
        response = self.client.post(
            "/api/posts/",
            {
                "title": "Novo", "slug": "novo", "author_id": 1, "tag_id": 2, "featured_image": png(),
                "content_html": "<p>ok</p><script>x()</script>", "published_at": "2026-09-24",
            },
            format="multipart",
            **self.csrf,
        )
        self.assertEqual(response.status_code, 201, response.content)
        data = response.json()
        self.assertEqual((data["author"]["id"], data["tag"]["slug"], data["content_html"]), (1, "tag-manager", "<p>ok</p>"))
        self.assertEqual(Post.objects.get(slug="novo").created_by, self.staff)

    def test_authors_and_tags_are_public(self):
        self.assertEqual(len(self.client.get("/api/tags/").json()), 5)
        self.assertEqual(self.client.get("/api/authors/").json()[0]["name"], "Nome Sobrenome")


@override_settings(DEFAULT_FROM_EMAIL="Metricaz <contato@metricaz.com>", CONTACT_DIGEST_TO="comercial@metricaz.com")
class ContactDigestTests(TestCase):
    def run_digest(self, *args):
        out = io.StringIO()
        call_command("send_contact_digest", *args, stdout=out)
        return out.getvalue()

    def add_everything(self):
        ContactSubmission.objects.create(name="Ana", email="ana@acme.com", company="ACME", message="Quero um orçamento", source_page="/contato")
        Lead.objects.create(email="lead@acme.com", source_page="/")
        NewsletterSubscriber.objects.create(email="news@acme.com")

    def test_nothing_new_sends_nothing(self):
        self.assertIn("Nada novo", self.run_digest())
        self.assertEqual(len(mail.outbox), 0)

    def test_one_email_with_everything_then_marked(self):
        self.add_everything()
        self.run_digest()

        self.assertEqual(len(mail.outbox), 1)
        email = mail.outbox[0]
        self.assertEqual(email.to, ["comercial@metricaz.com"])
        self.assertEqual(email.from_email, "Metricaz <contato@metricaz.com>")
        self.assertIn("1 mensagem(ns), 1 lead(s), 1 inscrição(ões)", email.subject)
        for text in ("Ana", "ana@acme.com", "Quero um orçamento", "lead@acme.com", "news@acme.com"):
            self.assertIn(text, email.body)
        self.assertIn("Quero um orçamento", email.alternatives[0].content)

        self.assertEqual(ContactSubmission.objects.get().status, "sent")
        self.assertIsNotNone(Lead.objects.get().notified_at)
        self.assertIsNotNone(NewsletterSubscriber.objects.get().notified_at)

        # next run: nothing left
        self.run_digest()
        self.assertEqual(len(mail.outbox), 1)

    def test_dry_run_sends_and_marks_nothing(self):
        self.add_everything()
        self.assertIn("[dry-run]", self.run_digest("--dry-run"))
        self.assertEqual(len(mail.outbox), 0)
        self.assertEqual(ContactSubmission.objects.get().status, "queued")

    @override_settings(CONTACT_DIGEST_TO="")
    def test_missing_settings_fails_without_marking(self):
        self.add_everything()
        with self.assertRaises(CommandError):
            self.run_digest()
        self.assertEqual(ContactSubmission.objects.get().status, "queued")

    def test_send_failure_keeps_everything_pending(self):
        self.add_everything()
        with mock.patch("django.core.mail.EmailMultiAlternatives.send", side_effect=OSError("relay down")):
            with self.assertRaises(CommandError):
                self.run_digest()
        self.assertEqual(ContactSubmission.objects.get().status, "queued")
        self.assertIsNone(Lead.objects.get().notified_at)
        self.assertIsNone(NewsletterSubscriber.objects.get().notified_at)
