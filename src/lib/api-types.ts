// Shapes returned by the Django API (backend/content/serializers.py).
// Image fields are absolute URLs, or null when nothing was uploaded.

type Ordered = {
  id: number;
  order_position: number;
  is_active: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
};

export type Sector = Ordered & {
  name: string;
};

export type Company = Ordered & {
  name: string;
  logo: string | null;
  logo_alt: string;
  website_url: string;
};

export type TeamMember = Ordered & {
  name: string;
  role: string;
  bio: string;
  photo: string | null;
  photo_alt: string;
  show_on_home: boolean;
  show_on_about: boolean;
};

export type Testimonial = Ordered & {
  name: string;
  role: string;
  company: string;
  text: string;
  show_in_client_panel: boolean;
  show_in_testimonials: boolean;
  show_on_about: boolean;
};

export type Service = Ordered & {
  title: string;
  slug: string;
  icon_name: string;
  excerpt: string;
  content_html: string;
};

export type Case = Ordered & {
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  kpi_value: string;
  kpi_label: string;
  client_name: string;
  service_stack: string;
  featured_image: string;
  featured_image_alt: string;
  content_html: string;
};

export type CompanyAddress = Ordered & {
  label: string;
  street: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  hours: string;
  map_url: string;
};

export type SiteOption = {
  key: string;
  label: string;
  value: string;
  description: string;
  updated_at: string;
};

export type WhatsAppSettings = {
  number: string;
  enabled: boolean;
  message: string;
  updated_at: string;
};

// Which flag a list of team members / testimonials is filtered by (?placement=).
export type TeamPlacement = 'home' | 'about';
export type TestimonialPlacement = 'client_panel' | 'testimonials' | 'about';

// Django auth.User, as returned by /api/auth/me/
export type User = {
  id: number;
  username: string;
  email: string;
};

// Received from visitors (staff-only reads)
export type ContactSubmission = {
  id: number;
  name: string;
  company: string;
  email: string;
  phone: string;
  message: string;
  source_page: string;
  source_context: string;
  status: 'queued' | 'sent' | 'failed';
  email_message_id: string;
  error_message: string;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type WhatsAppClick = {
  id: number;
  page_path: string;
  button_context: string;
  target_number: string;
  message_text: string;
  clicked_at: string;
};

export type SiteImage = {
  key: string;
  image: string;
  alt: string;
  description: string;
  updated_at: string;
};

export type MethodStep = Ordered & {
  title: string;
  text: string;
  icon_name: string;
  tags: string;
};

export type EngagementModel = Ordered & {
  title: string;
  text: string;
  icon_name: string;
};

export type Capability = Ordered & {
  label: string;
  icon_name: string;
};

export type AboutPillar = Ordered & {
  tag: string;
  title: string;
  text: string;
  image: string;
  image_alt: string;
};

export type AboutHighlight = Ordered & {
  title: string;
  text: string;
};

export type SocialLink = Ordered & {
  label: string;
  url: string;
};

export type Author = {
  id: number;
  name: string;
  mini_bio: string;
};

export type Tag = {
  id: number;
  name: string;
  slug: string;
};

export type Post = {
  id: number;
  title: string;
  slug: string;
  subtitle: string;
  author: Author | null;
  tag: Tag | null;
  featured_image: string;
  featured_image_alt: string;
  content_html: string;
  published_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};
