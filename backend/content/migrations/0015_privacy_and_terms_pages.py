"""Initial Privacy Policy and Terms of Use pages, at the same addresses as on the current metricaz.com.

Based on the current site's texts (29/10/2026): pt-BR wording, the ad/affiliate cookie paragraphs (a template
leftover) and a hidden link to a betting site removed, LGPD items added for what this site stores. The
WhatsApp Business section is kept as is. Legal text: to be reviewed by Metricaz before going live.

Never overwrites: pages are only created when the slug is free, and the footer "Privacidade" link only
changes while it still points nowhere ("#").
"""

from django.db import migrations

PRIVACY_HTML = """
<p><em>Última atualização: 29 de outubro de 2026.</em></p>
<p>A sua privacidade é importante para nós. É política da Metricaz respeitar a sua privacidade em relação a qualquer informação sua que possamos coletar no site da Metricaz e em outros sites que possuímos e operamos. Esta política explica quais dados coletamos, para que os usamos e quais são os seus direitos, conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018, LGPD).</p>
<h2>Quem é responsável pelos seus dados</h2>
<p>A Metricaz, com escritório na Rua Cardeal Arcoverde, 2365, 3º andar, Pinheiros, São Paulo/SP, CEP 05408-003, é a controladora dos dados pessoais tratados neste site. Dúvidas e pedidos sobre os seus dados podem ser enviados para <a href="mailto:contato@metricaz.com">contato@metricaz.com</a>.</p>
<h2>Quais dados coletamos e para quê</h2>
<p>Solicitamos informações pessoais apenas quando realmente precisamos delas para fornecer um serviço. Fazemos isso por meios justos e legais, com o seu conhecimento e consentimento, e informamos por que estamos coletando e como os dados serão usados.</p>
<ul>
<li><strong>Formulário de contato:</strong> nome, empresa, e-mail, telefone, mensagem e a página de onde o contato foi enviado. Usamos esses dados para responder ao seu pedido e conversar sobre os nossos serviços.</li>
<li><strong>Pedidos de diagnóstico ("Começar"):</strong> e-mail e página de origem, para entrarmos em contato com você.</li>
<li><strong>Newsletter:</strong> e-mail, para enviar conteúdos da Metricaz. Você pode cancelar a inscrição quando quiser.</li>
<li><strong>Cliques no botão do WhatsApp:</strong> registramos a página e o botão clicado, sem identificar quem clicou, para entender quais páginas geram mais conversas.</li>
</ul>
<h2>Cookies</h2>
<p>Atualmente, este site usa apenas os cookies necessários para o seu funcionamento e segurança. Se passarmos a usar ferramentas de mensuração ou de publicidade, esta política será atualizada e, quando a lei exigir, pediremos o seu consentimento antes.</p>
<h2>Por quanto tempo guardamos os dados</h2>
<p>Apenas retemos as informações coletadas pelo tempo necessário para fornecer o serviço solicitado ou para cumprir obrigações legais. Quando armazenamos dados, os protegemos por meios comercialmente aceitáveis para evitar perdas e roubos, bem como acesso, divulgação, cópia, uso ou modificação não autorizados.</p>
<h2>Compartilhamento</h2>
<p>Não compartilhamos informações de identificação pessoal publicamente ou com terceiros, exceto com fornecedores que nos ajudam a operar o site (como hospedagem e envio de e-mails), na medida necessária para isso, ou quando exigido por lei.</p>
<p>O nosso site pode ter links para sites externos que não são operados por nós. Não temos controle sobre o conteúdo e as práticas desses sites e não podemos aceitar responsabilidade por suas respectivas políticas de privacidade.</p>
<h2>Seus direitos</h2>
<p>Você pode, a qualquer momento, pedir a confirmação de que tratamos os seus dados, o acesso a eles, a correção de dados incompletos ou desatualizados, a exclusão dos dados tratados com o seu consentimento, a revogação desse consentimento e informações sobre com quem os compartilhamos. Basta escrever para <a href="mailto:contato@metricaz.com">contato@metricaz.com</a>.</p>
<p>Você é livre para recusar a nossa solicitação de informações pessoais, entendendo que talvez não possamos fornecer alguns dos serviços desejados.</p>
<h2>Integração com o WhatsApp Business</h2>
<p>Quando um cliente conecta a conta do WhatsApp Business à Metricaz pelo fluxo oficial de cadastro da Meta (Embedded Signup), recebemos e armazenamos os dados necessários para operar a integração: os identificadores do portfólio empresarial e da conta do WhatsApp Business, o número de telefone e o nome comercial verificado, além de um token de acesso concedido pela Meta, guardado de forma criptografada. Por meio da API oficial do WhatsApp Business, recebemos também as notificações da conta, como mensagens enviadas e recebidas e o status de entrega. Quando o cliente usa o mesmo número no aplicativo WhatsApp Business e autoriza o compartilhamento, recebemos ainda os contatos e o histórico de conversas do aplicativo.</p>
<p>Esses dados são usados exclusivamente para prestar os serviços contratados pelo cliente, como atendimento, envio de mensagens e relatórios, e são tratados conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e os termos da plataforma WhatsApp Business. A Metricaz não vende esses dados nem os compartilha com terceiros, exceto com a própria Meta, na medida necessária para o funcionamento da integração, ou quando houver obrigação legal.</p>
<p>O cliente pode revogar o acesso a qualquer momento, nas configurações do portfólio empresarial na Meta ou no próprio aplicativo WhatsApp Business. A exclusão dos dados pode ser solicitada pelo e-mail contato@metricaz.com ou pelo mecanismo de exclusão de dados da Meta. Após a revogação ou a solicitação, os dados da integração são excluídos, exceto os que precisarmos manter por obrigação legal ou regulatória.</p>
<h2>Alterações desta política</h2>
<p>Esta política pode ser atualizada para refletir mudanças no site ou na legislação. A data da última atualização fica sempre no início desta página. Se tiver qualquer dúvida sobre como tratamos os seus dados, entre em contato conosco.</p>
"""

TERMS_HTML = """
<h2>1. Termos</h2>
<p>Ao acessar o site da Metricaz, você concorda em cumprir estes termos de uso, todas as leis e regulamentos aplicáveis, e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.</p>
<h2>2. Uso de licença</h2>
<p>É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) do site da Metricaz, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título, e, sob esta licença, você não pode:</p>
<ul>
<li>modificar ou copiar os materiais;</li>
<li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
<li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site da Metricaz;</li>
<li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
<li>transferir os materiais para outra pessoa ou "espelhar" os materiais em qualquer outro servidor.</li>
</ul>
<p>Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida pela Metricaz a qualquer momento. Ao encerrar a visualização desses materiais ou após o término desta licença, você deve apagar todos os materiais baixados em sua posse, seja em formato eletrônico ou impresso.</p>
<h2>3. Compromisso do usuário</h2>
<p>O usuário se compromete a fazer uso adequado dos conteúdos e das informações que a Metricaz oferece no site, e, com caráter enunciativo, mas não limitativo:</p>
<ul>
<li>não se envolver em atividades que sejam ilegais ou contrárias à boa-fé e à ordem pública;</li>
<li>não difundir propaganda ou conteúdo de natureza racista, xenofóbica, de jogos de azar, qualquer tipo de pornografia ilegal, de apologia ao terrorismo ou contra os direitos humanos;</li>
<li>não causar danos aos sistemas físicos (hardware) e lógicos (software) da Metricaz, de seus fornecedores ou de terceiros, nem introduzir ou disseminar vírus ou quaisquer outros sistemas capazes de causar esses danos.</li>
</ul>
<h2>4. Isenção de responsabilidade</h2>
<p>Os materiais do site da Metricaz são fornecidos "como estão". A Metricaz não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.</p>
<p>Além disso, a Metricaz não garante nem faz qualquer representação relativa à precisão, aos resultados prováveis ou à confiabilidade do uso dos materiais em seu site ou de outra forma relacionados a esses materiais ou a sites vinculados a este site.</p>
<h2>5. Limitações</h2>
<p>Em nenhum caso a Metricaz ou seus fornecedores serão responsáveis por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro, ou devidos a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais do site da Metricaz, mesmo que a Metricaz ou um representante autorizado tenha sido notificado, oralmente ou por escrito, da possibilidade de tais danos. Como algumas jurisdições não permitem limitações em garantias implícitas, ou limitações de responsabilidade por danos consequentes ou incidentais, essas limitações podem não se aplicar a você.</p>
<h2>6. Precisão dos materiais</h2>
<p>Os materiais exibidos no site da Metricaz podem incluir erros técnicos, tipográficos ou fotográficos. A Metricaz não garante que qualquer material em seu site seja preciso, completo ou atual, e pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio. No entanto, a Metricaz não se compromete a atualizar os materiais.</p>
<h2>7. Links</h2>
<p>A Metricaz não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso do site pela Metricaz. O uso de qualquer site vinculado é por conta e risco do usuário.</p>
<h2>8. Modificações</h2>
<p>A Metricaz pode revisar estes termos de uso a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual destes termos.</p>
<h2>9. Lei aplicável</h2>
<p>Estes termos são regidos e interpretados de acordo com as leis da República Federativa do Brasil, e fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer questões decorrentes deles.</p>
"""

PAGES = [
    {
        "slug": "politica-de-privacidade",
        "title": "Política de Privacidade",
        "content_html": PRIVACY_HTML,
        "seo_title": "Política de Privacidade | Metricaz",
        "seo_description": "Como a Metricaz coleta, usa e protege os seus dados pessoais neste site, conforme a LGPD, e como "
        "exercer os seus direitos.",
        "order_position": 1,
    },
    {
        "slug": "termos-de-uso",
        "title": "Termos de Uso",
        "content_html": TERMS_HTML,
        "seo_title": "Termos de Uso | Metricaz",
        "seo_description": "Condições de uso do site da Metricaz: licença de uso dos materiais, responsabilidades, "
        "limitações e lei aplicável.",
        "order_position": 2,
    },
]


def forwards(apps, schema_editor):
    from content.sanitize import sanitize_html  # historical models skip save(): sanitize here

    Page = apps.get_model("content", "Page")
    for page in PAGES:
        fields = {**page, "content_html": sanitize_html(page["content_html"].strip())}
        Page.objects.get_or_create(slug=fields.pop("slug"), defaults=fields)

    SocialLink = apps.get_model("content", "SocialLink")
    SocialLink.objects.filter(label="Privacidade", url="#").update(url="/politica-de-privacidade")
    if not SocialLink.objects.filter(url="/termos-de-uso").exists():
        last = SocialLink.objects.order_by("-order_position").values_list("order_position", flat=True).first() or 0
        SocialLink.objects.create(label="Termos de uso", url="/termos-de-uso", order_position=last + 1)


class Migration(migrations.Migration):

    dependencies = [
        ("content", "0014_institutional_pages"),
    ]

    operations = [
        migrations.RunPython(forwards, migrations.RunPython.noop),
    ]
