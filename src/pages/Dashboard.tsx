import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { redirectToLogin } from '@/lib/auth';
import { api } from '@/lib/api';
import { Case, Company, ContactSubmission, Post, Sector, Service, TeamMember, Testimonial, WhatsAppSettings } from '@/lib/api-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  ChevronRight,
  ExternalLink,
  Building2,
  LayoutGrid,
  LogOut,
  MessageSquareQuote,
  FolderKanban,
  Newspaper,
  ArrowUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Users2,
} from 'lucide-react';
import { CompanyList } from '@/components/dashboard/CompanyList';
import { SectorList } from '@/components/dashboard/SectorList';
import { TeamList } from '@/components/dashboard/TeamList';
import { TestimonialList } from '@/components/dashboard/TestimonialList';
import { CaseList } from '@/components/dashboard/CaseList';
import { ServiceList } from '@/components/dashboard/ServiceList';
import { PostList } from '@/components/dashboard/PostList';
import { ContentEditorDialog, EditableContent } from '@/components/dashboard/ContentEditorDialog';
import { WhatsAppSettingsCard } from '@/components/dashboard/WhatsAppSettingsCard';
import { WhatsAppAnalyticsPanel } from '@/components/dashboard/WhatsAppAnalyticsPanel';
import { ContactSubmissionList } from '@/components/dashboard/ContactSubmissionList';
import logoMetricaz from '@/assets/logo-metricaz.webp';

type Tab = 'sectors' | 'companies' | 'team' | 'testimonials' | 'services' | 'cases' | 'posts' | 'whatsapp' | 'contact';
type SortDirection = 'asc' | 'desc';

const validTabs: Tab[] = ['sectors', 'companies', 'team', 'testimonials', 'services', 'cases', 'posts', 'whatsapp', 'contact'];
const defaultSortBy: Record<Tab, string> = {
  sectors: 'order_position',
  companies: 'order_position',
  team: 'order_position',
  testimonials: 'order_position',
  services: 'order_position',
  cases: 'order_position',
  posts: 'published_at',
  whatsapp: 'updated_at',
  contact: 'updated_at',
};
const defaultSortDirection: Record<Tab, SortDirection> = {
  sectors: 'asc',
  companies: 'asc',
  team: 'asc',
  testimonials: 'asc',
  services: 'asc',
  cases: 'asc',
  posts: 'desc',
  whatsapp: 'desc',
  contact: 'desc',
};
const sortOptions: Record<Tab, Array<{ value: string; label: string }>> = {
  sectors: [
    { value: 'name', label: 'Nome' },
    { value: 'order_position', label: 'Posicao' },
    { value: 'created_at', label: 'Data de criacao' },
  ],
  companies: [
    { value: 'name', label: 'Nome' },
    { value: 'order_position', label: 'Posicao' },
    { value: 'created_at', label: 'Data de criacao' },
  ],
  team: [
    { value: 'name', label: 'Nome' },
    { value: 'role', label: 'Cargo' },
    { value: 'order_position', label: 'Posicao' },
  ],
  testimonials: [
    { value: 'name', label: 'Nome' },
    { value: 'company', label: 'Empresa' },
    { value: 'order_position', label: 'Posicao' },
  ],
  services: [
    { value: 'title', label: 'Titulo' },
    { value: 'slug', label: 'Slug' },
    { value: 'icon_name', label: 'Icone' },
    { value: 'order_position', label: 'Posicao' },
    { value: 'created_at', label: 'Data de criacao' },
  ],
  cases: [
    { value: 'title', label: 'Titulo' },
    { value: 'slug', label: 'Slug' },
    { value: 'tag', label: 'Tag' },
    { value: 'order_position', label: 'Posicao' },
    { value: 'created_at', label: 'Data de criacao' },
  ],
  posts: [
    { value: 'published_at', label: 'Data de publicacao' },
    { value: 'title', label: 'Titulo' },
    { value: 'slug', label: 'Slug' },
  ],
  whatsapp: [{ value: 'updated_at', label: 'Atualizacao' }],
  contact: [{ value: 'created_at', label: 'Mais recentes' }],
};
const pageSize = 6;

const sections = {
  sectors: {
    title: 'Setores / Segmentos',
    description: 'Veja os setores exibidos no carousel (Marquee)',
    icon: LayoutGrid,
  },
  companies: {
    title: 'Empresas / Logos',
    description: 'Veja as empresas clientes da seção "Quem Confia"',
    icon: Building2,
  },
  team: {
    title: 'Time',
    description: 'Veja os membros do time e onde cada um aparece no site',
    icon: Users2,
  },
  testimonials: {
    title: 'Depoimentos',
    description: 'Veja os depoimentos e onde cada um aparece no site',
    icon: MessageSquareQuote,
  },
  services: {
    title: 'Serviços',
    description: 'Veja os serviços públicos e as páginas internas por slug',
    icon: Sparkles,
  },
  cases: {
    title: 'Cases',
    description: 'Veja os cards da home e as páginas internas de case por slug',
    icon: FolderKanban,
  },
  posts: {
    title: 'Blog',
    description: 'Veja os posts do blog e edite o conteúdo de cada um',
    icon: Newspaper,
  },
  whatsapp: {
    title: 'WhatsApp',
    description: 'Veja a configuração do botão e o relatório de cliques',
    icon: PhoneCall,
  },
  contact: {
    title: 'Contato',
    description: 'Veja as mensagens recebidas pelo formulário da home e das páginas internas',
    icon: MessageSquareQuote,
  },
} as const;

export const Dashboard = () => {
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('sectors');
  
  // Content is edited in the Django admin, except content_html (the editor below); staff sees active and inactive items.
  const [companies, setCompanies] = useState<Company[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [cases, setCases] = useState<Case[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings | null>(null);

  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<Record<Tab, string>>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<Record<Tab, SortDirection>>(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  // The one thing edited here: content_html of services, cases and posts (rich-text paste and images).
  const [editing, setEditing] = useState<{ endpoint: string; item: EditableContent } | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      redirectToLogin();
    }
  }, [user, loading]);

  useEffect(() => {
    if (!section || !validTabs.includes(section as Tab)) {
      navigate('/dashboard/sectors', { replace: true });
      return;
    }

    setActiveTab(section as Tab);
  }, [section, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);

      const [companiesData, sectorsData, teamData, testimonialsData, servicesData, casesData, postsData, whatsappData, submissionsData] =
        await Promise.all([
          api.get<Company[]>('/companies/'),
          api.get<Sector[]>('/sectors/'),
          api.get<TeamMember[]>('/team/'),
          api.get<Testimonial[]>('/testimonials/'),
          api.get<Service[]>('/services/'),
          api.get<Case[]>('/cases/'),
          api.get<Post[]>('/posts/'),
          api.get<WhatsAppSettings>('/whatsapp-settings/'),
          api.get<ContactSubmission[]>('/contact-submissions/'),
        ]);

      setCompanies(companiesData);
      setSectors(sectorsData);
      setTeam(teamData);
      setTestimonials(testimonialsData);
      setServices(servicesData);
      setCases(casesData);
      setPosts(postsData);
      setWhatsappSettings(whatsappData);
      setContactSubmissions(submissionsData);
      setLastUpdatedAt(new Date());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const replaceById = <T extends { id: number }>(items: T[], saved: T) =>
    items.map((item) => (item.id === saved.id ? saved : item));

  const handleContentSaved = (saved: EditableContent) => {
    if (editing?.endpoint === '/services/') setServices((items) => replaceById(items, saved as Service));
    if (editing?.endpoint === '/cases/') setCases((items) => replaceById(items, saved as Case));
    if (editing?.endpoint === '/posts/') setPosts((items) => replaceById(items, saved as Post));
    setEditing(null);
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSearchQuery('');
    setCurrentPage(1);
    navigate(`/dashboard/${tab}`);
  };

  const sectionCount = {
    sectors: sectors.length,
    companies: companies.length,
    team: team.length,
    testimonials: testimonials.length,
    services: services.length,
    cases: cases.length,
    posts: posts.length,
    whatsapp: 1,
    contact: 1,
  };

  const currentSection = sections[activeTab];

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredSectors = sectors.filter((sector) =>
    sector.name.toLowerCase().includes(normalizedQuery)
  );

  const filteredCompanies = companies.filter((company) =>
    [company.name, company.logo_alt || '', company.website_url || ''].join(' ').toLowerCase().includes(normalizedQuery)
  );

  const filteredTeam = team.filter((member) =>
    [member.name, member.role, member.bio || ''].join(' ').toLowerCase().includes(normalizedQuery)
  );

  const filteredTestimonials = testimonials.filter((testimonial) =>
    [testimonial.name, testimonial.role, testimonial.company, testimonial.text]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  );

  const filteredServices = services.filter((service) =>
    [service.title, service.slug, service.icon_name, service.excerpt, service.content_html]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  );

  const filteredCases = cases.filter((caseItem) =>
    [
      caseItem.title,
      caseItem.slug,
      caseItem.tag,
      caseItem.excerpt,
      caseItem.client_name || '',
      caseItem.service_stack || '',
      caseItem.kpi_value,
      caseItem.kpi_label,
    ]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  );

  const filteredPosts = posts.filter((post) =>
    [post.title, post.subtitle, post.slug, post.tag?.name || '', post.author?.name || '']
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  );

  const filteredContact = whatsappSettings ? [whatsappSettings] : [];
  const filteredWhatsApp = whatsappSettings ? [whatsappSettings] : [];
  const filteredSubmissions = contactSubmissions.filter((submission) =>
    [submission.name, submission.company || '', submission.email, submission.phone || '', submission.message, submission.source_page || '', submission.source_context || '', submission.status]
      .join(' ')
      .toLowerCase()
      .includes(normalizedQuery)
  );

  const filteredCount = {
    sectors: filteredSectors.length,
    companies: filteredCompanies.length,
    team: filteredTeam.length,
    testimonials: filteredTestimonials.length,
    services: filteredServices.length,
    cases: filteredCases.length,
    posts: filteredPosts.length,
    whatsapp: filteredWhatsApp.length,
    contact: filteredContact.length,
  };

  const getSortedData = <T extends Record<string, unknown>>(items: T[], tab: Tab) => {
    const key = sortBy[tab];
    const direction = sortDirection[tab] === 'asc' ? 1 : -1;

    return [...items].sort((a, b) => {
      const aValue = a[key];
      const bValue = b[key];

      if (aValue === bValue) return 0;

      if (key === 'created_at' || key === 'published_at') {
        const aDate = new Date(String(aValue)).getTime();
        const bDate = new Date(String(bValue)).getTime();
        return (aDate - bDate) * direction;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }

      const aText = String(aValue ?? '').toLowerCase();
      const bText = String(bValue ?? '').toLowerCase();
      return aText.localeCompare(bText, 'pt-BR') * direction;
    });
  };

  const sortedSectors = useMemo(() => getSortedData(filteredSectors, 'sectors'), [filteredSectors, sortBy, sortDirection]);
  const sortedCompanies = useMemo(() => getSortedData(filteredCompanies, 'companies'), [filteredCompanies, sortBy, sortDirection]);
  const sortedTeam = useMemo(() => getSortedData(filteredTeam, 'team'), [filteredTeam, sortBy, sortDirection]);
  const sortedTestimonials = useMemo(
    () => getSortedData(filteredTestimonials, 'testimonials'),
    [filteredTestimonials, sortBy, sortDirection],
  );
  const sortedServices = useMemo(() => getSortedData(filteredServices, 'services'), [filteredServices, sortBy, sortDirection]);
  const sortedCases = useMemo(() => getSortedData(filteredCases, 'cases'), [filteredCases, sortBy, sortDirection]);
  const sortedPosts = useMemo(() => getSortedData(filteredPosts, 'posts'), [filteredPosts, sortBy, sortDirection]);

  const activeItemsCount = filteredCount[activeTab];
  const totalPages = Math.max(1, Math.ceil(activeItemsCount / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, sortBy, sortDirection]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginateData = <T,>(items: T[]) => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  };

  const pagedSectors = paginateData(sortedSectors);
  const pagedCompanies = paginateData(sortedCompanies);
  const pagedTeam = paginateData(sortedTeam);
  const pagedTestimonials = paginateData(sortedTestimonials);
  const pagedServices = paginateData(sortedServices);
  const pagedCases = paginateData(sortedCases);
  const pagedPosts = paginateData(sortedPosts);

  const renderActiveList = () => {
    if (activeTab === 'whatsapp' || activeTab === 'contact') {
      return <WhatsAppSettingsCard settings={whatsappSettings} />;
    }

    if (activeTab === 'sectors') return <SectorList sectors={pagedSectors} />;
    if (activeTab === 'companies') return <CompanyList companies={pagedCompanies} />;
    if (activeTab === 'team') return <TeamList team={pagedTeam} />;
    if (activeTab === 'services')
      return <ServiceList services={pagedServices} onEdit={(item) => setEditing({ endpoint: '/services/', item })} />;
    if (activeTab === 'cases')
      return <CaseList cases={pagedCases} onEdit={(item) => setEditing({ endpoint: '/cases/', item })} />;
    if (activeTab === 'posts')
      return <PostList posts={pagedPosts} onEdit={(item) => setEditing({ endpoint: '/posts/', item })} />;
    return <TestimonialList testimonials={pagedTestimonials} />;
  };

  const hasSearchResults = filteredCount[activeTab] > 0;
  const rangeStart = activeItemsCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, activeItemsCount);
  const isWhatsAppTab = activeTab === 'whatsapp';
  const isContactTab = activeTab === 'contact';

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-deep via-ink to-ink-soft/95 text-foreground">
      <div className="mx-auto w-full max-w-[1500px] px-4 py-5 md:px-6 lg:px-8 lg:py-8">
        <div className={`grid gap-5 ${sidebarCollapsed ? 'lg:grid-cols-[95px_1fr]' : 'lg:grid-cols-[300px_1fr]'}`}>
          <aside className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <div className="relative h-full overflow-hidden rounded-3xl border border-border/80 bg-card/70 p-6 shadow-card backdrop-blur">
              <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-primary/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />

              <div className="relative z-10 flex h-full flex-col">
                <div className="mb-5 hidden justify-end lg:flex">
                  <button
                    type="button"
                    onClick={() => setSidebarCollapsed((prev) => !prev)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-card/50 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={sidebarCollapsed ? 'Expandir menu lateral' : 'Recolher menu lateral'}
                  >
                    {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
                  </button>
                </div>

                <div className={`flex items-center border-b border-border/70 pb-5 ${sidebarCollapsed ? 'justify-center' : 'gap-4'}`}>
                  <div className="h-12 w-12 overflow-hidden rounded-xl border border-border/70 bg-ink-soft p-2.5">
                    <img src={logoMetricaz} alt="Metricaz" width={394} height={103} className="h-full w-full object-contain" />
                  </div>
                  {!sidebarCollapsed && (
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">Painel</p>
                      <h1 className="font-display text-xl font-semibold">Metricaz Admin</h1>
                    </div>
                  )}
                </div>

                <div className="mt-6 grid gap-2">
                  {(Object.keys(sections) as Tab[]).map((tab) => {
                    const section = sections[tab];
                    const Icon = section.icon;
                    const isActive = activeTab === tab;

                    return (
                      <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`group flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all ${
                          isActive
                            ? 'border-primary/60 bg-primary/18 text-foreground shadow-[0_10px_35px_-20px_rgba(255,97,60,0.8)]'
                            : 'border-border/70 bg-card/35 text-muted-foreground hover:border-primary/30 hover:bg-primary/10 hover:text-foreground'
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="h-4 w-4" />
                          {!sidebarCollapsed && <span className="text-sm font-medium">{section.title}</span>}
                        </span>
                        {!sidebarCollapsed && (
                          <span className="rounded-full border border-border/80 bg-ink-soft/80 px-2 py-0.5 text-xs text-foreground/90">
                            {sectionCount[tab]}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-auto space-y-3 border-t border-border/70 pt-5">
                  <Button
                    asChild
                    variant="outline"
                    className={`gap-2 border-border/90 bg-card/70 hover:bg-card ${sidebarCollapsed ? 'w-full px-0' : 'w-full justify-center'}`}
                  >
                    <a href="/admin/" aria-label="Abrir admin do Django">
                      <ExternalLink className="h-4 w-4" />
                      {!sidebarCollapsed && 'Admin'}
                    </a>
                  </Button>
                  {!sidebarCollapsed && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Sessão ativa
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{user?.username}</p>
                    </div>
                  )}
                  <Button
                    variant="outline"
                    onClick={handleLogout}
                    className={`gap-2 border-border/90 bg-card/70 hover:bg-card ${sidebarCollapsed ? 'w-full px-0' : 'w-full justify-center'}`}
                  >
                    <LogOut className="h-4 w-4" />
                    {!sidebarCollapsed && 'Sair'}
                  </Button>
                </div>
              </div>
            </div>
          </aside>

          <main className="space-y-5">
            <section className="overflow-hidden rounded-3xl border border-border/80 bg-card/65 p-5 shadow-card backdrop-blur md:p-7">
              <div className="pointer-events-none absolute" />
              <div className="mb-5 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.17em] text-muted-foreground">
                <span>Dashboard</span>
                <ChevronRight className="h-3.5 w-3.5" />
                <span className="text-foreground">{currentSection.title}</span>
              </div>
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-primary">Dashboard de conteúdo</p>
                  <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">{currentSection.title}</h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{currentSection.description}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Última atualização:{' '}
                    {lastUpdatedAt
                      ? lastUpdatedAt.toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'ainda não sincronizado'}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    onClick={fetchData}
                    className="h-11 gap-2 border-border/90 bg-card/70 px-5 text-sm"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Atualizar
                  </Button>
                </div>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Setores</p>
                <p className="mt-3 text-3xl font-semibold">{sectors.length}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Empresas</p>
                <p className="mt-3 text-3xl font-semibold">{companies.length}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Time</p>
                <p className="mt-3 text-3xl font-semibold">{team.length}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Depoimentos</p>
                <p className="mt-3 text-3xl font-semibold">{testimonials.length}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Serviços</p>
                <p className="mt-3 text-3xl font-semibold">{services.length}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Cases</p>
                <p className="mt-3 text-3xl font-semibold">{cases.length}</p>
              </div>
              <div className="rounded-2xl border border-border/80 bg-card/60 p-4 shadow-card">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Contato</p>
                <p className="mt-3 text-3xl font-semibold">{whatsappSettings?.enabled ? 'Ativo' : 'Inativo'}</p>
              </div>
            </section>

            {isWhatsAppTab ? (
              <div className="space-y-5">
                <section className="rounded-3xl border border-border/80 bg-card/65 p-5 shadow-card backdrop-blur md:p-7">
                  {renderActiveList()}
                </section>
                <WhatsAppAnalyticsPanel />
              </div>
            ) : isContactTab ? (
              <section className="rounded-3xl border border-border/80 bg-card/65 p-5 shadow-card backdrop-blur md:p-7">
                <div className="mb-5 flex items-center justify-between gap-3 border-b border-border/70 pb-5">
                  <div>
                    <p className="eyebrow">// Caixa de entrada</p>
                    <h3 className="editorial mt-3 text-3xl md:text-4xl">Mensagens do formulário</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Veja aqui tudo o que chegou pela home, Quem Somos e página de contato.
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {filteredSubmissions.length} mensagens
                  </div>
                </div>
                <ContactSubmissionList submissions={filteredSubmissions} />
              </section>
            ) : (
              <section className="rounded-3xl border border-border/80 bg-card/65 p-5 shadow-card backdrop-blur md:p-7">
                <div className="mb-5 flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-center sm:justify-between">
                  <div className="grid w-full gap-3 lg:grid-cols-[1fr_220px_170px]">
                    <div className="relative w-full">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder={`Buscar em ${currentSection.title.toLowerCase()}...`}
                        className="h-11 border-border/90 bg-card/75 pl-9"
                      />
                    </div>

                    <select
                      value={sortBy[activeTab]}
                      onChange={(event) =>
                        setSortBy((prev) => ({
                          ...prev,
                          [activeTab]: event.target.value,
                        }))
                      }
                      className="h-11 rounded-md border border-border/90 bg-card/75 px-3 text-sm outline-none focus:border-primary/60"
                    >
                      {sortOptions[activeTab].map((option) => (
                        <option key={option.value} value={option.value}>
                          Ordenar: {option.label}
                        </option>
                      ))}
                    </select>

                    <Button
                      variant="outline"
                      onClick={() =>
                        setSortDirection((prev) => ({
                          ...prev,
                          [activeTab]: prev[activeTab] === 'asc' ? 'desc' : 'asc',
                        }))
                      }
                      className="h-11 gap-2 border-border/90 bg-card/75"
                    >
                      <ArrowUpDown className="h-4 w-4" />
                      {sortDirection[activeTab] === 'asc' ? 'Crescente' : 'Decrescente'}
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Exibindo {filteredCount[activeTab]} de {sectionCount[activeTab]} registros
                  </div>
                </div>

                {loading ? (
                  <div className="py-20 text-center text-muted-foreground">Carregando dados do painel...</div>
                ) : !hasSearchResults && normalizedQuery ? (
                  <Card className="border-border/80 bg-card/55 p-10 text-center">
                    <p className="text-base font-medium">Nenhum resultado para "{searchQuery}"</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Tente buscar por outro termo ou limpe o campo para ver todos os registros.
                    </p>
                  </Card>
                ) : (
                  renderActiveList()
                )}

                {!loading && activeItemsCount > 0 && (
                  <div className="mt-6 flex flex-col items-start justify-between gap-3 border-t border-border/70 pt-5 text-sm sm:flex-row sm:items-center">
                    <p className="text-muted-foreground">
                      Mostrando {rangeStart}-{rangeEnd} de {activeItemsCount}
                    </p>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </Button>
                      <span className="rounded-md border border-border/80 bg-card/70 px-3 py-2 text-xs text-muted-foreground">
                        Pagina {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                      >
                        Proxima
                      </Button>
                    </div>
                  </div>
                )}
              </section>
            )}
          </main>
        </div>
      </div>

      {editing && (
        <ContentEditorDialog
          key={`${editing.endpoint}${editing.item.id}`}
          endpoint={editing.endpoint}
          item={editing.item}
          onClose={() => setEditing(null)}
          onSaved={handleContentSaved}
        />
      )}
    </div>
  );
};
