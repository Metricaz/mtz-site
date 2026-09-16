-- Metricaz Dashboard Database Schema
-- Prefix: s_ (site)
-- Date: 2026-07-07

-- Tabela de usuários do dashboard
CREATE TABLE IF NOT EXISTS s_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de setores/segmentos (textos para o Marquee)
CREATE TABLE IF NOT EXISTS s_sectors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES s_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de empresas clientes/logos (para a seção "Quem Confia")
CREATE TABLE IF NOT EXISTS s_companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  logo_url TEXT NOT NULL,
  logo_alt TEXT,
  website_url TEXT,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES s_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de membros do time
CREATE TABLE IF NOT EXISTS s_team (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  bio TEXT,
  image_url TEXT NOT NULL,
  image_alt TEXT,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES s_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de depoimentos
CREATE TABLE IF NOT EXISTS s_testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  testimonial TEXT NOT NULL,
  section VARCHAR(50) NOT NULL DEFAULT 'clients',
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES s_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabela de cases (home + pagina interna por slug)
CREATE TABLE IF NOT EXISTS s_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  tag VARCHAR(120) NOT NULL,
  excerpt TEXT NOT NULL,
  kpi_value VARCHAR(60) NOT NULL,
  kpi_label VARCHAR(120) NOT NULL,
  client_name VARCHAR(255),
  service_stack VARCHAR(255),
  featured_image_url TEXT NOT NULL,
  featured_image_alt TEXT,
  content_html TEXT NOT NULL,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES s_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_s_users_email ON s_users(email);
CREATE INDEX IF NOT EXISTS idx_s_sectors_order ON s_sectors(order_position);
CREATE INDEX IF NOT EXISTS idx_s_sectors_active ON s_sectors(is_active);
CREATE INDEX IF NOT EXISTS idx_s_sectors_created_by ON s_sectors(created_by);
CREATE INDEX IF NOT EXISTS idx_s_companies_order ON s_companies(order_position);
CREATE INDEX IF NOT EXISTS idx_s_companies_active ON s_companies(is_active);
CREATE INDEX IF NOT EXISTS idx_s_companies_created_by ON s_companies(created_by);

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
CREATE INDEX IF NOT EXISTS idx_s_team_order ON s_team(order_position);
CREATE INDEX IF NOT EXISTS idx_s_team_active ON s_team(is_active);
CREATE INDEX IF NOT EXISTS idx_s_team_created_by ON s_team(created_by);
CREATE INDEX IF NOT EXISTS idx_s_testimonials_section ON s_testimonials(section);
CREATE INDEX IF NOT EXISTS idx_s_testimonials_order ON s_testimonials(order_position);
CREATE INDEX IF NOT EXISTS idx_s_testimonials_active ON s_testimonials(is_active);
CREATE INDEX IF NOT EXISTS idx_s_testimonials_created_by ON s_testimonials(created_by);
CREATE INDEX IF NOT EXISTS idx_s_cases_slug ON s_cases(slug);
CREATE INDEX IF NOT EXISTS idx_s_cases_order ON s_cases(order_position);
CREATE INDEX IF NOT EXISTS idx_s_cases_active ON s_cases(is_active);
CREATE INDEX IF NOT EXISTS idx_s_cases_created_by ON s_cases(created_by);

-- Tabela de serviços (home + páginas internas por slug)
CREATE TABLE IF NOT EXISTS s_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  icon_name VARCHAR(80) NOT NULL,
  excerpt TEXT NOT NULL,
  content_html TEXT NOT NULL,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES s_users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_s_services_slug ON s_services(slug);
CREATE INDEX IF NOT EXISTS idx_s_services_order ON s_services(order_position);
CREATE INDEX IF NOT EXISTS idx_s_services_active ON s_services(is_active);
CREATE INDEX IF NOT EXISTS idx_s_services_created_by ON s_services(created_by);

-- Tabela de configuracoes gerais do site
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

-- RLS (Row Level Security) - Desabilitado por enquanto, habilitar depois se necessário
-- Mais tarde você pode descomentar:
-- ALTER TABLE s_users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE s_sectors ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE s_companies ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE s_team ENABLE ROW LEVEL SECURITY;

-- Comentários para documentação
COMMENT ON TABLE s_users IS 'Usuários autenticados do dashboard Metricaz';
COMMENT ON TABLE s_sectors IS 'Setores/segmentos para o Marquee (apenas texto)';
COMMENT ON TABLE s_companies IS 'Empresas clientes com logos (seção "Quem Confia")';
COMMENT ON TABLE s_team IS 'Membros do time (seção "Quem constrói com você")';
COMMENT ON TABLE s_testimonials IS 'Depoimentos de clientes (seções "//clientes" e "//Depoimentos")';
COMMENT ON TABLE s_cases IS 'Cases do site com página dedicada por slug';
COMMENT ON TABLE s_services IS 'Serviços do site com página dedicada por slug';
COMMENT ON TABLE s_site_settings IS 'Configuracoes gerais do site, incluindo o botao de WhatsApp';
COMMENT ON TABLE s_whatsapp_clicks IS 'Eventos de clique do WhatsApp com pagina e horario';
COMMENT ON TABLE s_contact_submissions IS 'Envios do formulario de contato com status do email';
COMMENT ON COLUMN s_users.password_hash IS 'Hash bcrypt da senha (nunca armazenar senha em texto plano)';
COMMENT ON COLUMN s_sectors.order_position IS 'Ordem de exibição no carousel (0 = primeira)';
COMMENT ON COLUMN s_companies.order_position IS 'Ordem de exibição no carousel (0 = primeira)';
COMMENT ON COLUMN s_companies.website_url IS 'URL pública do cliente para abrir em nova aba';
COMMENT ON COLUMN s_team.image_url IS 'URL da foto/imagem do membro do time';
COMMENT ON COLUMN s_team.order_position IS 'Ordem de exibição no carousel (0 = primeira)';
COMMENT ON COLUMN s_testimonials.section IS 'Seção onde o depoimento será exibido: "clients" (//clientes) ou "testimonials" (//Depoimentos)';
COMMENT ON COLUMN s_testimonials.order_position IS 'Ordem de exibição no carousel (0 = primeira)';
COMMENT ON COLUMN s_cases.slug IS 'Slug unico da URL do case. Ex: livelo-ga4';
COMMENT ON COLUMN s_services.slug IS 'Slug unico da URL do serviço. Ex: seo';

-- Supabase Storage para cases (imagem de destaque e imagens do editor)
INSERT INTO storage.buckets (id, name, public)
VALUES ('cases-media', 'cases-media', true)
ON CONFLICT (id) DO NOTHING;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can read case media'
  ) THEN
    CREATE POLICY "Public can read case media"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'cases-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can upload case media'
  ) THEN
    CREATE POLICY "Public can upload case media"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'cases-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can update case media'
  ) THEN
    CREATE POLICY "Public can update case media"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'cases-media')
    WITH CHECK (bucket_id = 'cases-media');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND policyname = 'Public can delete case media'
  ) THEN
    CREATE POLICY "Public can delete case media"
    ON storage.objects
    FOR DELETE
    USING (bucket_id = 'cases-media');
  END IF;
END
$$;
