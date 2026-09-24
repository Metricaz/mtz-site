// Django auth.User, as returned by /api/auth/me/
export type User = {
  id: number;
  username: string;
  email: string;
};

export type Sector = {
  id: string;
  name: string;
  order_position: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  name: string;
  logo_url: string;
  logo_alt?: string;
  website_url?: string;
  order_position: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image_url: string;
  image_alt?: string;
  order_position: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  company: string;
  testimonial: string;
  section: 'clients' | 'testimonials';
  order_position: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SiteCase = {
  id: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  kpi_value: string;
  kpi_label: string;
  client_name?: string;
  service_stack?: string;
  featured_image_url: string;
  featured_image_alt?: string;
  content_html: string;
  order_position: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SiteService = {
  id: string;
  title: string;
  slug: string;
  icon_name: string;
  excerpt: string;
  content_html: string;
  order_position: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type SiteSettings = {
  id: number;
  whatsapp_number: string | null;
  whatsapp_enabled: boolean;
  whatsapp_message: string | null;
  created_at: string;
  updated_at: string;
};

export type WhatsAppClick = {
  id: string;
  page_path: string;
  button_context: string;
  target_number: string | null;
  message_text: string | null;
  clicked_at: string;
};

export type ContactSubmission = {
  id: string;
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  message: string;
  source_page: string | null;
  source_context: string | null;
  status: 'queued' | 'sent' | 'failed';
  resend_email_id: string | null;
  error_message: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
};
