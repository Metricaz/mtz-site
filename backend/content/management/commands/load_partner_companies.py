"""
Load ONLY the partner companies (with logos) and the logos.display option, without touching the
rest of the site content (unlike `loaddata initial_content`, which resets everything):

    cd backend && env/bin/python manage.py load_partner_companies --dry-run
    cd backend && env/bin/python manage.py load_partner_companies

The list comes from the companies in fixtures/initial_content.json and the logos from
fixtures/media/companies/. Companies are matched by name (created or updated, never duplicated);
companies that are not in the list are deactivated, not deleted. logos.display is only created
when missing, so a value already chosen in the admin is kept. Safe to run more than once.
"""

import json
from pathlib import Path

from django.core.files import File
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from content.models import Company, SiteOption

FIXTURES = Path(__file__).resolve().parents[2] / "fixtures"

DISPLAY_OPTION = {
    "key": "logos.display",
    "value": "nomes",
    "description": 'Home · Quem confia · exibição: "logos" mostra os logos; "nomes" (ou vazio) mostra os nomes.',
}


class Command(BaseCommand):
    help = "Carrega só as empresas parceiras (com logos) e a opção logos.display, sem mexer no resto do conteúdo."

    def add_arguments(self, parser):
        parser.add_argument("--dry-run", action="store_true", help="Mostra o que mudaria sem gravar nada.")

    def handle(self, *args, dry_run=False, **options):
        data = json.loads((FIXTURES / "initial_content.json").read_text(encoding="utf-8"))
        companies = [o["fields"] for o in data if o["model"] == "content.company"]
        missing = [c["logo"] for c in companies if c["logo"] and not (FIXTURES / "media" / c["logo"]).is_file()]
        if missing:
            raise CommandError(f"Logos não encontrados em fixtures/media: {', '.join(missing)}")

        names = {c["name"] for c in companies}
        existing = set(Company.objects.filter(name__in=names).values_list("name", flat=True))
        to_deactivate = list(Company.objects.filter(is_active=True).exclude(name__in=names).values_list("name", flat=True))
        create_option = not SiteOption.objects.filter(key=DISPLAY_OPTION["key"]).exists()

        summary = (
            f"{len(names - existing)} empresa(s) nova(s), {len(existing)} atualizada(s), "
            f"{len(to_deactivate)} desativada(s)"
            + (f" ({', '.join(sorted(to_deactivate))})" if to_deactivate else "")
            + (f"; opção {DISPLAY_OPTION['key']} criada" if create_option else "")
        )
        if dry_run:
            self.stdout.write(f"[dry-run] Faria: {summary}.")
            return

        for c in companies:
            if c["logo"]:
                if default_storage.exists(c["logo"]):
                    default_storage.delete(c["logo"])
                with open(FIXTURES / "media" / c["logo"], "rb") as source:
                    default_storage.save(c["logo"], File(source))

        with transaction.atomic():
            for c in companies:
                Company.objects.update_or_create(
                    name=c["name"],
                    defaults={
                        "logo": c["logo"],
                        "logo_alt": c["logo_alt"],
                        "order_position": c["order_position"],
                        "is_active": c["is_active"],
                    },
                    # a site already filled in the admin is kept
                    create_defaults={
                        "logo": c["logo"],
                        "logo_alt": c["logo_alt"],
                        "order_position": c["order_position"],
                        "is_active": c["is_active"],
                        "website_url": c["website_url"],
                    },
                )
            Company.objects.filter(name__in=to_deactivate).update(is_active=False)
            if create_option:
                SiteOption.objects.create(**DISPLAY_OPTION)

        self.stdout.write(self.style.SUCCESS(f"Empresas carregadas: {summary}."))
