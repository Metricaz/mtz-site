-- Script de Setup Inicial do Dashboard
-- Execute este script no Supabase SQL Editor para criar um usuário de teste

-- Colar o SQL das tabelas (database.sql) primeiro

-- Garantir a tabela de configuracoes do site
CREATE TABLE IF NOT EXISTS s_site_settings (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  whatsapp_number TEXT,
  whatsapp_enabled BOOLEAN DEFAULT true,
  whatsapp_message TEXT DEFAULT 'Olá, vim pelo site da Metricaz e gostaria de conversar.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 's_site_settings'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 's_site_settings'
      AND column_name = 'whatsapp_message'
  ) THEN
    ALTER TABLE s_site_settings ADD COLUMN whatsapp_message TEXT DEFAULT 'Olá, vim pelo site da Metricaz e gostaria de conversar.';
  END IF;
END
$$;

INSERT INTO s_site_settings (id, whatsapp_number, whatsapp_enabled, whatsapp_message)
VALUES (1, '5511999999999', true, 'Olá, vim pelo site da Metricaz e gostaria de conversar.')
ON CONFLICT (id) DO NOTHING;

-- Tabela de cliques do WhatsApp
CREATE TABLE IF NOT EXISTS s_whatsapp_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  button_context VARCHAR(120) NOT NULL,
  target_number TEXT,
  message_text TEXT,
  clicked_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_s_whatsapp_clicks_clicked_at ON s_whatsapp_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_s_whatsapp_clicks_page_path ON s_whatsapp_clicks(page_path);
CREATE INDEX IF NOT EXISTS idx_s_whatsapp_clicks_button_context ON s_whatsapp_clicks(button_context);

-- Tabela de envio dos formulários de contato
CREATE TABLE IF NOT EXISTS s_contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,
  source_page TEXT,
  source_context VARCHAR(120),
  status VARCHAR(30) NOT NULL DEFAULT 'queued',
  resend_email_id TEXT,
  error_message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT s_contact_submissions_status_check CHECK (status IN ('queued', 'sent', 'failed'))
);

CREATE INDEX IF NOT EXISTS idx_s_contact_submissions_created_at ON s_contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_s_contact_submissions_source_page ON s_contact_submissions(source_page);
CREATE INDEX IF NOT EXISTS idx_s_contact_submissions_status ON s_contact_submissions(status);

-- Se a tabela s_companies já existir sem a coluna website_url, adiciona a coluna antes dos inserts
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 's_companies'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 's_companies'
      AND column_name = 'website_url'
  ) THEN
    ALTER TABLE s_companies ADD COLUMN website_url TEXT;
  END IF;
END
$$;

-- Criar usuário de teste (email: admin@metricaz.com)
-- SENHA: Metricaz@2024 (você DEVE MUDAR isto em produção!)
-- Hash bcrypt da senha gerado com: bcrypt.hash('Metricaz@2024', 10)

INSERT INTO s_users (email, password_hash, is_active) 
VALUES (
  'admin@metricaz.com',
  '$2a$10$K7OtXbqN1uY9qX7q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q9q', -- SUBSTITUIR COM HASH REAL
  true
)
ON CONFLICT (email) DO UPDATE SET is_active = true;

-- Inserir algumas empresas de exemplo
INSERT INTO s_companies (name, logo_url, logo_alt, website_url, order_position, created_by) 
SELECT 
  'Google' as name,
  'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png' as logo_url,
  'Google Logo' as logo_alt,
  'https://google.com' as website_url,
  0 as order_position,
  (SELECT id FROM s_users WHERE email = 'admin@metricaz.com') as created_by
WHERE NOT EXISTS (
  SELECT 1 FROM s_companies WHERE name = 'Google' AND is_active = true
);

-- Inserir serviços de exemplo
INSERT INTO s_services (title, slug, icon_name, excerpt, content_html, order_position, created_by)
SELECT
  'SEO' as title,
  'seo' as slug,
  'seo' as icon_name,
  'Auditoria técnica, estratégia de conteúdo e link building com foco em crescimento orgânico previsível.' as excerpt,
  '<h2>SEO orientado a negócio</h2><p>Estruturamos a presença orgânica para gerar demanda qualificada, apoiar a jornada de compra e ampliar previsibilidade de receita.</p><h3>Frentes de atuação</h3><ul><li>Auditoria técnica e correção de gargalos</li><li>Arquitetura de conteúdo e clusters temáticos</li><li>Estratégia de autoridade e desempenho orgânico</li></ul>' as content_html,
  0 as order_position,
  (SELECT id FROM s_users WHERE email = 'admin@metricaz.com') as created_by
WHERE NOT EXISTS (
  SELECT 1 FROM s_services WHERE slug = 'seo' AND is_active = true
);

INSERT INTO s_services (title, slug, icon_name, excerpt, content_html, order_position, created_by)
SELECT
  'CRO & Testes A/B' as title,
  'cro' as slug,
  'cro' as icon_name,
  'Hipóteses baseadas em dados, experimentação contínua e otimização da jornada de conversão.' as excerpt,
  '<h2>Conversão com método</h2><p>Testamos, priorizamos e ajustamos a experiência para transformar mais tráfego em resultado real.</p><h3>Frentes de atuação</h3><ul><li>Auditoria de UX e comportamento</li><li>Hipóteses ICE e roadmap de testes</li><li>Experimentação e leitura estatística</li></ul>' as content_html,
  1 as order_position,
  (SELECT id FROM s_users WHERE email = 'admin@metricaz.com') as created_by
WHERE NOT EXISTS (
  SELECT 1 FROM s_services WHERE slug = 'cro' AND is_active = true
);

INSERT INTO s_services (title, slug, icon_name, excerpt, content_html, order_position, created_by)
SELECT
  'Digital Analytics' as title,
  'analytics' as slug,
  'analytics' as icon_name,
  'Mensuração ponta a ponta com GA4, GTM, server-side tracking e dashboards acionáveis.' as excerpt,
  '<h2>Mensuração confiável</h2><p>Construímos uma base de dados clara para que marketing, produto e liderança tomem decisão com segurança.</p><h3>Frentes de atuação</h3><ul><li>Setup e migração para GA4</li><li>Tagueamento e governança</li><li>Integração com mídia e BI</li></ul>' as content_html,
  2 as order_position,
  (SELECT id FROM s_users WHERE email = 'admin@metricaz.com') as created_by
WHERE NOT EXISTS (
  SELECT 1 FROM s_services WHERE slug = 'analytics' AND is_active = true
);

INSERT INTO s_services (title, slug, icon_name, excerpt, content_html, order_position, created_by)
SELECT
  'Desenvolvimento' as title,
  'desenvolvimento' as slug,
  'development' as icon_name,
  'Software sob medida, integrações e automações que sustentam a operação data-driven.' as excerpt,
  '<h2>Produto e automação</h2><p>Desenvolvemos camadas técnicas que conectam sistemas, simplificam fluxos e sustentam operações mais inteligentes.</p><h3>Frentes de atuação</h3><ul><li>Integrações com APIs e dados</li><li>Web apps e ferramentas internas</li><li>Automação de processos e relatórios</li></ul>' as content_html,
  3 as order_position,
  (SELECT id FROM s_users WHERE email = 'admin@metricaz.com') as created_by
WHERE NOT EXISTS (
  SELECT 1 FROM s_services WHERE slug = 'desenvolvimento' AND is_active = true
);

-- Para gerar um hash bcrypt válido, use este comando Node.js/JavaScript:
-- const bcrypt = require('bcryptjs');
-- bcrypt.hash('sua_senha_aqui', 10).then(hash => console.log(hash));

-- Edge Function necessária para o formulário de contato:
-- Deploy: supabase/functions/contact-form/index.ts
-- Variáveis de ambiente:
-- RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL
