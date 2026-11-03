"""Privacy Policy: section on clients' Meta ad account data (app Metricaz BI Connector, 03/11/2026), at
/politica-de-privacidade#anuncios (the app's data deletion URL).

Never overwrites: the section goes in just before "Alterações desta política" only while the page has no such
section yet, and the "última atualização" date only changes while it is still the original one.
"""

from django.db import migrations

SLUG = "politica-de-privacidade"
ANCHOR = "<h2>Alterações desta política</h2>"
HEADING = "Integração com plataformas de anúncios (Meta)</h2>"
OLD_DATE = "Última atualização: 29 de outubro de 2026."
NEW_DATE = "Última atualização: 3 de novembro de 2026."

ADS_HTML = """
<h2 id="anuncios">Integração com plataformas de anúncios (Meta)</h2>
<p>Quando um cliente compartilha conosco as suas contas de anúncio da Meta (Facebook e Instagram), por acesso de parceiro no portfólio empresarial ou pelo aplicativo Metricaz BI Connector, acessamos, somente para leitura, os dados de desempenho dessas contas: identificadores e nomes das contas, campanhas, conjuntos de anúncios e anúncios, e métricas como investimento, impressões, alcance, cliques e conversões. Esses dados são agregados e não identificam as pessoas que viram os anúncios ou interagiram com eles.</p>
<p>Esses dados são usados exclusivamente para produzir as análises e os relatórios contratados pelo cliente, ficam armazenados em ambiente de nuvem com acesso restrito à equipe da Metricaz e são tratados conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e os termos da plataforma da Meta. A Metricaz não vende esses dados nem os compartilha com terceiros, exceto com fornecedores de infraestrutura, na medida necessária para o serviço, ou quando houver obrigação legal.</p>
<p>O cliente pode revogar o acesso a qualquer momento, removendo a Metricaz como parceira nas configurações do portfólio empresarial na Meta. A exclusão dos dados já coletados pode ser solicitada pelo e-mail <a href="mailto:contato@metricaz.com">contato@metricaz.com</a>, informando as contas de anúncio; os dados são excluídos em até 30 dias, exceto os que precisarmos manter por obrigação legal ou contratual.</p>
"""


def forwards(apps, schema_editor):
    from content.sanitize import sanitize_html  # historical models skip save(): sanitize here

    Page = apps.get_model("content", "Page")
    page = Page.objects.filter(slug=SLUG).first()
    if page is None or HEADING in page.content_html or ANCHOR not in page.content_html:
        return
    html = page.content_html.replace(ANCHOR, ADS_HTML.strip() + "\n" + ANCHOR, 1).replace(OLD_DATE, NEW_DATE, 1)
    page.content_html = sanitize_html(html)
    page.save(update_fields=["content_html"])


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0017_page_headings"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
