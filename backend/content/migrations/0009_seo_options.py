"""Per-page titles and descriptions for search engines (SEO and GEO audit, 28/10/2026).

Existing rows are never overwritten: only missing options are created and blank SEO fields filled in,
so whatever was already edited in the admin stays as it is.
"""

from django.db import migrations

OLD_HOME_TITLE = "Metricaz · Consultoria de SEO, CRO e Digital Analytics"
OLD_HOME_DESCRIPTION = (
    "Transformamos dados em vantagem competitiva. Consultoria de SEO, CRO, Digital Analytics e "
    "desenvolvimento de software com método e rigor analítico."
)

# key: (value, description shown in the admin)
OPTIONS = {
    "seo.site_name": ("Metricaz", "Nome do site: vai depois do título das páginas e na prévia de links compartilhados."),
    "seo.home.title": (
        "Consultoria de SEO, CRO e Analytics em São Paulo | Metricaz",
        "Título da página inicial na aba e nos resultados de busca.",
    ),
    "seo.home.description": (
        "Consultoria de SEO, CRO, Digital Analytics e desenvolvimento. Mais de 80 marcas atendidas em 12 anos. "
        "Peça um diagnóstico e transforme dados em receita.",
        "Descrição da página inicial para buscadores e compartilhamento.",
    ),
    "seo.about.title": (
        "Quem somos: time sênior de SEO, CRO e Analytics | Metricaz",
        "Título do Quem Somos na aba e nos resultados de busca.",
    ),
    "seo.about.description": (
        "Conheça a Metricaz: consultoria de performance com time sênior em SEO, CRO, Digital Analytics e "
        "desenvolvimento. +80 marcas atendidas.",
        "Descrição do Quem Somos para buscadores e compartilhamento.",
    ),
    "seo.services.title": (
        "Serviços de SEO, CRO, Analytics e Desenvolvimento | Metricaz",
        "Título da página Serviços na aba e nos resultados de busca.",
    ),
    "seo.services.description": (
        "Conheça os serviços da Metricaz: SEO, CRO e testes A/B, Digital Analytics (GA4, GTM, server-side) e "
        "desenvolvimento sob medida.",
        "Descrição da página Serviços para buscadores e compartilhamento.",
    ),
    "seo.blog.title": (
        "Blog Metricaz: SEO, CRO e Digital Analytics na prática",
        "Título do Blog na aba e nos resultados de busca.",
    ),
    "seo.blog.description": (
        "Artigos práticos sobre SEO, GEO, CRO, GA4, GTM e Consent Mode escritos pelo time da Metricaz. "
        "Estratégia com dados, sem achismo.",
        "Descrição do Blog para buscadores e compartilhamento.",
    ),
    "seo.contact.title": (
        "Fale com a Metricaz | Diagnóstico de SEO, CRO e Analytics",
        "Título da página Contato na aba e nos resultados de busca.",
    ),
    "seo.contact.description": (
        "Fale com a Metricaz e conte seu desafio em SEO, CRO ou Analytics. Retorno em até 1 dia útil. "
        "Escritório em Pinheiros, São Paulo.",
        "Descrição da página Contato para buscadores e compartilhamento.",
    ),
}

# slug: (seo_title, seo_description)
SERVICES = {
    "seo": (
        "Consultoria de SEO Técnico e Estratégico | Metricaz",
        "Auditoria técnica de SEO, arquitetura de conteúdo e estratégia de autoridade para crescer em tráfego "
        "orgânico com previsibilidade. Fale com a Metricaz.",
    ),
    "cro": (
        "Consultoria de CRO e Testes A/B | Metricaz",
        "Auditoria de UX, hipóteses priorizadas por ICE e testes A/B com leitura estatística para aumentar a "
        "conversão do seu site ou e-commerce.",
    ),
    "analytics": (
        "Digital Analytics: GA4, GTM e Server-Side | Metricaz",
        "Implementação e migração de GA4, GTM, server-side tracking e dashboards em Looker Studio e BigQuery, "
        "com governança e conformidade LGPD.",
    ),
    "desenvolvimento": (
        "Desenvolvimento de Software e Integrações | Metricaz",
        "Integrações com APIs, web apps, ferramentas internas e automação de relatórios para sustentar "
        "operações data-driven. Fale com a Metricaz.",
    ),
}

CASES = {
    "livelo-ga4": (
        "Case Livelo + GA4: +71% em vendas e −30% no CAC | Metricaz",
        "Como estruturamos o GA4, integramos Firebase e AppsFlyer e conectamos o Google Ads para a Livelo: +71% "
        "nas vendas do Clube, −30% no CAC, −40% no CPC.",
    ),
    "iot-analytics": (
        "Case Burger King: Analytics em autoatendimento | Metricaz",
        "Como a Metricaz mediu a interação em totens de autoatendimento do Burger King Brasil, criou dashboards e "
        "integrou jornadas online e offline com User ID.",
    ),
}


def fill_blank_seo(model, entries):
    for slug, (title, description) in entries.items():
        item = model.objects.filter(slug=slug).first()
        if item is None:
            continue
        item.seo_title = item.seo_title or title
        item.seo_description = item.seo_description or description
        # update(): skips save(), which would re-run the HTML sanitizer for nothing.
        model.objects.filter(pk=item.pk).update(seo_title=item.seo_title, seo_description=item.seo_description)


def forwards(apps, schema_editor):
    SiteOption = apps.get_model("content", "SiteOption")

    # seo.title / seo.description were the same for every page; now they belong to the home page.
    for old, new, old_default in (
        ("seo.title", "seo.home.title", OLD_HOME_TITLE),
        ("seo.description", "seo.home.description", OLD_HOME_DESCRIPTION),
    ):
        option = SiteOption.objects.filter(key=old).first()
        if option is None or SiteOption.objects.filter(key=new).exists():
            continue
        option.key = new
        if option.value == old_default:
            option.value = OPTIONS[new][0]
        option.description = OPTIONS[new][1]
        option.save()

    for key, (value, description) in OPTIONS.items():
        SiteOption.objects.get_or_create(key=key, defaults={"value": value, "description": description})

    fill_blank_seo(apps.get_model("content", "Service"), SERVICES)
    fill_blank_seo(apps.get_model("content", "Case"), CASES)


def backwards(apps, schema_editor):
    SiteOption = apps.get_model("content", "SiteOption")
    for old, new in (("seo.title", "seo.home.title"), ("seo.description", "seo.home.description")):
        SiteOption.objects.filter(key=new).update(key=old)


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0008_seo_fields"),
    ]

    operations = [
        migrations.RunPython(forwards, backwards),
    ]
