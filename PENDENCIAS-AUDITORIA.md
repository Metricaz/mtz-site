# Pendências da auditoria de SEO e GEO (documento do Uanderson)

Lista do que precisa de **informação, texto ou decisão da equipe** para fechar os itens da auditoria.
O que é só código vai sendo feito no projeto (área `seo-urgente`).

Última atualização: 29/10/2026

## Antes de ir ao ar (30/10/2026)

- [ ] **Bloqueio do Google só no site de teste.** A linha `add_header X-Robots-Tag "noindex, nofollow"` em `deploy-assets/sites-available/mtz-site.conf` **não pode** ir para a configuração do metricaz.com, senão o site oficial some do Google. (Ciro)
- [ ] **Redirecionamentos 301** do site atual para o novo: o site atual tem a lista de páginas em https://metricaz.com/sitemap_index.xml. Privacidade e Termos de Uso já usam os mesmos endereços do site atual. (Ciro)
- [ ] **`/sitemap.xml` e `/robots.txt` vêm do Django:** a configuração do nginx de produção precisa mandar esses dois endereços para o Django, como já faz a de homologação (`location ~ ^/(api|admin|...|sitemap\.xml|robots\.txt)`). (Ciro)
- [ ] **Depois da troca:** enviar `https://metricaz.com/sitemap.xml` no Google Search Console.
- [ ] **Conferir as páginas na tela** (computador e celular) na homologação depois do merge: menu, rodapé, Cases, Privacidade, Termos, formulários. Atenção à **etiqueta nova acima do título da home** e aos **títulos mais longos das páginas de serviço** (quebra de linha no celular).
- [ ] **Validar os dados estruturados** na homologação: https://search.google.com/test/rich-results (colar o endereço de uma página; testar home, um serviço, um post, um case e Contato).
- [ ] **Revisar a Política de Privacidade e os Termos de Uso** (painel → Páginas). Confirmar e-mail para assuntos de dados (hoje: contato@metricaz.com), endereço e, se quiserem, incluir CNPJ.
- [ ] **Imagem padrão de compartilhamento** (WhatsApp, LinkedIn): 1200×630, no painel do Django → Imagens do site, chave `seo.og_image`.

## Google Tag Manager (documento do Gus)

- [ ] **Confirmar com o Gus o ID no código do `<head>`:** o último valor de `})(window,document,'script','dataLayer','');` está vazio no documento (o `noscript` usa `GTM-PMMZBGH`). Foi implementado exatamente como está no documento.
- [ ] **Atualizar a Política de Privacidade** (seção "Cookies"): hoje ela diz que o site usa apenas cookies essenciais. Com o GTM/Google Analytics isso muda; o texto e o consentimento (Consent Mode) ficam a definir com o Gus.

## Informações a levantar

- [ ] **Case Burger King:** resultado real para o card (hoje "20% Tagueamento", que não é uma métrica clara). Ex.: aumento de conversão no totem, redução do tempo de pedido.
- [ ] **Case Consent Mode:** o card mostra "0 GTM" como resultado (não é uma métrica) e a etiqueta "gtm, consent mode, lgpd, configurar" parece lista de palavras-chave. Definir um resultado real e uma etiqueta curta (ex.: "Consent Mode, GTM").
- [ ] **Case Burger King:** imagens ou capturas de dashboard (com permissão do cliente).
- [ ] **Case Livelo:** texto alternativo da imagem de capa (descrever o que a imagem mostra). Aprovar o título sugerido: "Livelo + GA4: como unificamos a mensuração do maior programa de recompensas do Brasil".
- [ ] **Números ocultos por enquanto:** os números da home (faixa abaixo do título e o painel "Em números") e o resultado de cada case (cards e página do case) estão escondidos no código (`SHOW_HOME_NUMBERS` e `SHOW_CASE_NUMBERS` em `src/lib/stats.ts`). Os valores continuam no painel. Para voltar a mostrar, pedir ao time técnico. Os números da página Quem Somos continuam aparecendo.
- [ ] **Números do site que não batem:** "+312% receita orgânica média" (home) x "+300% média de ganho" (Quem Somos); "99.8% de confiabilidade de coleta" sem explicação. Definir o número certo e de onde ele vem (período, metodologia).
- [ ] **Ano de fundação:** os dados estruturados já usam **2014** (sugestão da auditoria), em Opções do site → `company.founding_year`. Confirmar o ano e alinhar os textos do site (hoje dizem "há 12 anos", inclusive a descrição da home para o Google).
- [ ] **Depoimentos:** autorização de uso (o da Whirlpool é de uma marca que não está na faixa de logos), foto, cargo e LinkedIn de quem deu o depoimento.
- [ ] **Time (Quem Somos):** bio de 2 a 3 linhas, certificações e LinkedIn de cada head.
- [ ] **Fotos do time:** todas no mesmo formato, em pé (3:4, ex.: 600×800), em WebP. No site atual há fotos em tamanhos e proporções diferentes, em JPEG.
- [ ] **Imagens do blog e dos cases:** de preferência em WebP, em formato 4:3 (ex.: 1536×1152), com texto alternativo descrevendo a imagem (não repetir o título).
- [ ] **Contato:** telefone e WhatsApp oficiais; endereços de Orlando e Cafelândia (completar ou remover as abas).
- [ ] **Perfis externos da marca** para os dados estruturados: Google Business Profile, Clutch, Google Partners etc. (se existirem). Hoje vão LinkedIn e Instagram, tirados dos Links do rodapé.
- [ ] **Autores do blog:** os posts informam ao Google o nome e a minibio do autor (painel → Autores). Preencher nome real e minibio de cada autor.

- [ ] **Endereços (painel → Endereços):** o país de São Paulo está como "Brasil" e o de Orlando como "US". Para o Google, o ideal é o código de duas letras (BR, US) nos dois.

## Textos a revisar (títulos da auditoria já aplicados)

- [ ] **Home:** a etiqueta nova "Consultoria de SEO, CRO e Digital Analytics" (Opções do site → `hero.eyebrow`) repete o começo do texto logo abaixo do título (`hero.subtitle`). Avaliar se ajusta um dos dois.
- [ ] **Títulos aplicados** (dá para editar no painel): Serviços (`servicespage.title`), Quem Somos (`about.title`), Blog (`blogpage.title`) e o campo "título da página" de cada serviço.
- [ ] **Títulos dos cases e posts** sugeridos pela auditoria (Livelo, Burger King, Consent Mode, Dimensões, GTM): mudar junto com a revisão do texto de cada um.
- [ ] **Títulos de seção "criativos"** (ex.: "Quatro pilares. Um único objetivo: resultado."): a auditoria sugere manter o tom e acrescentar um subtítulo descritivo. Decidir com o time de conteúdo.

## Conteúdo a escrever

- [ ] **4 páginas de serviço** (SEO, CRO, Analytics, Desenvolvimento): 800 a 1.200 palavras cada, com entregáveis, processo, resultados e perguntas frequentes. Depende da análise de palavras-chave prevista.
- [ ] **Página Serviços:** introdução de 100 a 150 palavras explicando como os 4 serviços se conectam.
- [ ] **Posts a atualizar:** Consent Mode (para v2), Dimensões Personalizadas (para GA4), Google Tag Manager (afirmações sem fonte, imagem de banco de imagens). Manter as datas originais de publicação.
- [ ] **Perguntas frequentes da home** (3 a 5 perguntas com respostas de 40 a 60 palavras).
- [ ] **Calendário editorial** com as 12 pautas sugeridas na seção 5.3 da auditoria.
