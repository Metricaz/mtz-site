"""Founding year for the structured data (SEO and GEO audit, 29/10/2026, item 6). Never overwrites."""

from django.db import migrations

OPTIONS = {
    "company.founding_year": (
        "2014",
        "Ano de fundação da Metricaz (só o ano). Vai nos dados estruturados para o Google e as IAs.",
    ),
}


def forwards(apps, schema_editor):
    SiteOption = apps.get_model("content", "SiteOption")
    for key, (value, description) in OPTIONS.items():
        SiteOption.objects.get_or_create(key=key, defaults={"value": value, "description": description})


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0015_privacy_and_terms_pages"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
