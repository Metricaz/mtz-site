"""
Send ONE e-mail with everything that arrived since the last run: contact messages, leads and
newsletter sign-ups. Meant for an hourly cron, e.g.:

    0 * * * *  cd /srv/metricaz/backend && env/bin/python manage.py send_contact_digest

Sender (DEFAULT_FROM_EMAIL), recipient (CONTACT_DIGEST_TO) and the SMTP relay (MAILERS) come from
settings / environment. Nothing new = nothing is sent. If sending fails, nothing is
marked as sent, so everything goes out again on the next run.
"""

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.template.loader import render_to_string
from django.utils import timezone

from content.models import ContactSubmission, Lead, NewsletterSubscriber


class Command(BaseCommand):
    help = "Envia um e-mail com o resumo de mensagens de contato, leads e inscrições ainda não enviados."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Mostra o resumo sem enviar nem marcar nada.")

    def handle(self, *args, dry_run=False, **options):
        submissions = list(ContactSubmission.objects.filter(status=ContactSubmission.Status.QUEUED).order_by("created_at"))
        leads = list(Lead.objects.filter(notified_at__isnull=True).order_by("created_at"))
        subscribers = list(NewsletterSubscriber.objects.filter(notified_at__isnull=True).order_by("created_at"))

        if not (submissions or leads or subscribers):
            self.stdout.write("Nada novo para enviar.")
            return

        counts = f"{len(submissions)} mensagem(ns), {len(leads)} lead(s), {len(subscribers)} inscrição(ões)"
        if dry_run:
            self.stdout.write(f"[dry-run] Enviaria: {counts}.")
            return

        if not settings.CONTACT_DIGEST_TO or not settings.DEFAULT_FROM_EMAIL:
            raise CommandError("Defina CONTACT_DIGEST_TO e DEFAULT_FROM_EMAIL (settings / ambiente).")

        context = {"submissions": submissions, "leads": leads, "subscribers": subscribers}
        email = EmailMultiAlternatives(
            subject=f"Metricaz · Resumo do site: {counts}",
            body=render_to_string("content/email/contact_digest.txt", context),
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[settings.CONTACT_DIGEST_TO],
        )
        email.attach_alternative(render_to_string("content/email/contact_digest.html", context), "text/html")

        try:
            email.send()
        except Exception as error:  # SMTP/relay problems: keep everything pending for the next run
            raise CommandError(f"Falha ao enviar o resumo ({counts}); nada foi marcado como enviado: {error}") from error

        now = timezone.now()
        with transaction.atomic():
            ContactSubmission.objects.filter(pk__in=[s.pk for s in submissions]).update(
                status=ContactSubmission.Status.SENT, error_message="", updated_at=now
            )
            Lead.objects.filter(pk__in=[lead.pk for lead in leads]).update(notified_at=now)
            NewsletterSubscriber.objects.filter(pk__in=[s.pk for s in subscribers]).update(notified_at=now)

        self.stdout.write(self.style.SUCCESS(f"Resumo enviado para {settings.CONTACT_DIGEST_TO}: {counts}."))
