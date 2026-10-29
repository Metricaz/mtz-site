"""Title and description of the new /cases page (SEO and GEO audit, 28/10/2026, item 4.8). Never overwrites."""

from django.db import migrations

OPTIONS = {
    "seo.cases.title": (
        "Cases de SEO, CRO e Analytics | Metricaz",
        "Título da página Cases na aba e nos resultados de busca.",
    ),
    "seo.cases.description": (
        "Cases da Metricaz em SEO, CRO e Digital Analytics: desafios, soluções e resultados de marcas como "
        "Livelo e Burger King.",
        "Descrição da página Cases para buscadores e compartilhamento.",
    ),
}


def forwards(apps, schema_editor):
    SiteOption = apps.get_model("content", "SiteOption")
    for key, (value, description) in OPTIONS.items():
        SiteOption.objects.get_or_create(key=key, defaults={"value": value, "description": description})


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0011_fix_case_data"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
