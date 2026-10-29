"""Descriptive H1s (SEO and GEO audit, 29/10/2026, S6): the audit's suggested headings.

Never overwrites: options are only changed while they still hold the original text, and a service's
"título da página" is only filled in while blank.
"""

from django.db import migrations, models

SERVICE_HEADLINES = {
    "seo": "Consultoria de SEO para crescimento orgânico previsível",
    "cro": "CRO e testes A/B para converter mais com o mesmo tráfego",
    "analytics": "Digital Analytics: mensuração confiável com GA4, GTM e server-side",
    "desenvolvimento": "Desenvolvimento de software, integrações e automações para operações data-driven",
}

# key: (original text, new text)
CHANGED_OPTIONS = {
    "servicespage.title": ("O que fazemos", "Serviços de SEO, CRO, Digital Analytics e Desenvolvimento"),
    "about.title": (
        "Somos uma consultoria de performance que mistura *estratégia, dados e execução.*",
        "Consultoria de performance que une *estratégia, dados e execução.*",
    ),
}

# key: (value, description shown in the admin)
NEW_OPTIONS = {
    "hero.eyebrow": (
        "Consultoria de SEO, CRO e Digital Analytics",
        "Home: etiqueta acima do título principal. Faz parte do título (H1) para o Google: diga o que a Metricaz faz.",
    ),
    "blogpage.title": (
        "Blog: SEO, CRO e *Digital Analytics* na prática",
        "Página Blog: título principal (H1). A seção de blog da home usa content.title.",
    ),
}


def forwards(apps, schema_editor):
    Service = apps.get_model("content", "Service")
    SiteOption = apps.get_model("content", "SiteOption")
    for slug, headline in SERVICE_HEADLINES.items():
        Service.objects.filter(slug=slug, headline="").update(headline=headline)
    for key, (old, new) in CHANGED_OPTIONS.items():
        SiteOption.objects.filter(key=key, value=old).update(value=new)
    for key, (value, description) in NEW_OPTIONS.items():
        SiteOption.objects.get_or_create(key=key, defaults={"value": value, "description": description})


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0016_founding_year"),
    ]

    operations = [
        migrations.AddField(
            model_name="service",
            name="headline",
            field=models.CharField(
                blank=True,
                help_text="Título principal (H1) da página do serviço, descritivo. Vazio = o título acima, que fica no menu e nos cartões.",
                max_length=255,
                verbose_name="título da página",
            ),
        ),
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
