# Pendências da auditoria de SEO e GEO (documento do Uanderson)

Lista do que precisa de **informação, texto ou decisão da equipe** para fechar os itens da auditoria.
O que é só código vai sendo feito no projeto (área `seo-urgente`).

Última atualização: 29/10/2026

## Antes de ir ao ar (30/10/2026)

- [ ] **Bloqueio do Google só no site de teste.** A linha `add_header X-Robots-Tag "noindex, nofollow"` em `deploy-assets/sites-available/mtz-site.conf` **não pode** ir para a configuração do metricaz.com, senão o site oficial some do Google. (Ciro)
- [ ] **Redirecionamentos 301** do site atual para o novo: o site atual tem a lista de páginas em https://metricaz.com/sitemap_index.xml. Privacidade e Termos de Uso já usam os mesmos endereços do site atual. (Ciro)
- [ ] **`/sitemap.xml` e `/robots.txt` vêm do Django:** a configuração do nginx de produção precisa mandar esses dois endereços para o Django, como já faz a de homologação (`location ~ ^/(api|admin|...|sitemap\.xml|robots\.txt)`). (Ciro)
- [ ] **Depois da troca:** enviar `https://metricaz.com/sitemap.xml` no Google Search Console.
- [ ] **Conferir as páginas na tela** (computador e celular) na homologação depois do merge: menu, rodapé, Cases, Privacidade, Termos, formulários.
- [ ] **Revisar a Política de Privacidade e os Termos de Uso** (painel → Páginas). Confirmar e-mail para assuntos de dados (hoje: contato@metricaz.com), endereço e, se quiserem, incluir CNPJ.
- [ ] **Imagem padrão de compartilhamento** (WhatsApp, LinkedIn): 1200×630, no painel do Django → Imagens do site, chave `seo.og_image`.

## Google Tag Manager (documento do Gus)

- [ ] **Confirmar com o Gus o ID no código do `<head>`:** o último valor de `})(window,document,'script','dataLayer','');` está vazio no documento (o `noscript` usa `GTM-PMMZBGH`). Foi implementado exatamente como está no documento.
- [ ] **Atualizar a Política de Privacidade** (seção "Cookies"): hoje ela diz que o site usa apenas cookies essenciais. Com o GTM/Google Analytics isso muda; o texto e o consentimento (Consent Mode) ficam a definir com o Gus.

## Informações a levantar

- [ ] **Case Burger King:** resultado real para o card (hoje "20% Tagueamento", que não é uma métrica clara). Ex.: aumento de conversão no totem, redução do tempo de pedido.
- [ ] **Case Burger King:** imagens ou capturas de dashboard (com permissão do cliente).
- [ ] **Case Livelo:** texto alternativo da imagem de capa (descrever o que a imagem mostra). Aprovar o título sugerido: "Livelo + GA4: como unificamos a mensuração do maior programa de recompensas do Brasil".
- [ ] **Números do site que não batem:** "+312% receita orgânica média" (home) x "+300% média de ganho" (Quem Somos); "99.8% de confiabilidade de coleta" sem explicação. Definir o número certo e de onde ele vem (período, metodologia).
- [ ] **Ano de fundação** para usar em todo o site e nos dados estruturados (a auditoria sugere 2014; hoje o site diz "há 12 anos").
- [ ] **Depoimentos:** autorização de uso (o da Whirlpool é de uma marca que não está na faixa de logos), foto, cargo e LinkedIn de quem deu o depoimento.
- [ ] **Time (Quem Somos):** bio de 2 a 3 linhas, certificações e LinkedIn de cada head.
- [ ] **Contato:** telefone e WhatsApp oficiais; endereços de Orlando e Cafelândia (completar ou remover as abas).
- [ ] **Perfis externos da marca** para os dados estruturados: Google Business Profile, Clutch, Google Partners etc. (se existirem).

## Conteúdo a escrever

- [ ] **4 páginas de serviço** (SEO, CRO, Analytics, Desenvolvimento): 800 a 1.200 palavras cada, com entregáveis, processo, resultados e perguntas frequentes. Depende da análise de palavras-chave prevista.
- [ ] **Página Serviços:** introdução de 100 a 150 palavras explicando como os 4 serviços se conectam.
- [ ] **Posts a atualizar:** Consent Mode (para v2), Dimensões Personalizadas (para GA4), Google Tag Manager (afirmações sem fonte, imagem de banco de imagens). Manter as datas originais de publicação.
- [ ] **Perguntas frequentes da home** (3 a 5 perguntas com respostas de 40 a 60 palavras).
- [ ] **Calendário editorial** com as 12 pautas sugeridas na seção 5.3 da auditoria.
