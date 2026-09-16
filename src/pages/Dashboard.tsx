import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Company, ContactSubmission, Sector, SiteCase, SiteService, SiteSettings, TeamMember, Testimonial } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/sonner';
import {
  ChevronRight,
  Building2,
  LayoutGrid,
  LogOut,
  MessageSquareQuote,
  FolderKanban,
  ArrowUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Sparkles,
  PhoneCall,
  Users2,
} from 'lucide-react';
import { CompanyForm } from '@/components/dashboard/CompanyForm';
import { CompanyList } from '@/components/dashboard/CompanyList';
import { SectorForm } from '@/components/dashboard/SectorForm';
import { SectorList } from '@/components/dashboard/SectorList';
import { TeamForm } from '@/components/dashboard/TeamForm';
import { TeamList } from '@/components/dashboard/TeamList';
import { TestimonialForm } from '@/components/dashboard/TestimonialForm';
import { TestimonialList } from '@/components/dashboard/TestimonialList';
import { CaseForm } from '@/components/dashboard/CaseForm';
import { CaseList } from '@/components/dashboard/CaseList';
import { ServiceForm } from '@/components/dashboard/ServiceForm';
import { ServiceList } from '@/components/dashboard/ServiceList';
import { ContactSettingsForm } from '@/components/dashboard/ContactSettingsForm';
import { WhatsAppAnalyticsPanel } from '@/components/dashboard/WhatsAppAnalyticsPanel';
import { ContactSubmissionList } from '@/components/dashboard/ContactSubmissionList';
import logoMetricaz from '@/assets/logo-metricaz.webp';
import { isMissingSupabaseTableError } from '@/lib/supabase-errors';

type Tab = 'sectors' | 'companies' | 'team' | 'testimonials' | 'services' | 'cases' | 'whatsapp' | 'contact';
type SortDirection = 'asc' | 'desc';

const validTabs: Tab[] = ['sectors', 'companies', 'team', 'testimonials', 'services', 'cases', 'whatsapp', 'contact'];
const defaultSortBy: Record<Tab, string> = {
  sectors: 'order_position',
  companies: 'order_position',
  team: 'order_position',
  testimonials: 'order_position',
  services: 'order_position',
  cases: 'order_position',
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
    { value: 'section', label: 'Secao' },
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
  whatsapp: [{ value: 'updated_at', label: 'Atualizacao' }],
  contact: [{ value: 'created_at', label: 'Mais recentes' }],
};
const pageSize = 6;

const sections = {
  sectors: {
    title: 'Setores / Segmentos',
    description: 'Gerencie os setores exibidos no carousel (Marquee)',
    actionLabel: 'Adicionar Setor',
    icon: LayoutGrid,
  },
  companies: {
    title: 'Empresas / Logos',
    description: 'Gerencie as empresas clientes da seção "Quem Confia"',
    actionLabel: 'Adicionar Empresa',
    icon: Building2,
  },
  team: {
    title: 'Time',
    description: 'Gerencie os membros da seção "Quem constrói com você"',
    actionLabel: 'Adicionar Membro',
    icon: Users2,
  },
  testimonials: {
    title: 'Depoimentos',
    description: 'Gerencie depoimentos das seções //clientes e //Depoimentos',
    actionLabel: 'Adicionar Depoimento',
    icon: MessageSquareQuote,
  },
  services: {
    title: 'Serviços',
    description: 'Gerencie os serviços públicos e as páginas internas por slug',
    actionLabel: 'Adicionar Serviço',
    icon: Sparkles,
  },
  cases: {
    title: 'Cases',
    description: 'Gerencie os cards da home e as páginas internas de case por slug',
    actionLabel: 'Adicionar Case',
    icon: FolderKanban,
  },
  whatsapp: {
    title: 'WhatsApp',
    description: 'Configure o botão, a mensagem padrão e veja o relatório de cliques',
    actionLabel: 'Salvar configurações',
    icon: PhoneCall,
  },
  contact: {
    title: 'Contato',
    description: 'Veja as mensagens recebidas pelo formulário da home e das páginas internas',
    actionLabel: 'Atualizar mensagens',
    icon: MessageSquareQuote,
  },
} as const;

export const Dashboard = () => {
  const navigate = useNavigate();
  const { section } = useParams<{ section: string }>();
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('sectors');
  
  // Companies state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showCompanyForm, setShowCompanyForm] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  
  // Sectors state
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [showSectorForm, setShowSectorForm] = useState(false);
  const [editingSector, setEditingSector] = useState<Sector | null>(null);
  
  // Team state
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null);
  
  // Testimonials state
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showTestimonialForm, setShowTestimonialForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  // Services state
  const [services, setServices] = useState<SiteService[]>([]);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<SiteService | null>(null);

  // Cases state
  const [cases, setCases] = useState<SiteCase[]>([]);
  const [showCaseForm, setShowCaseForm] = useState(false);
  const [editingCase, setEditingCase] = useState<SiteCase | null>(null);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [contactSettings, setContactSettings] = useState<SiteSettings>({
    id: 1,
    whatsapp_number: '',
    whatsapp_enabled: true,
    whatsapp_message: 'Olá, vim pelo site da Metricaz e gostaria de conversar.',
    created_at: '',
    updated_at: '',
  });
  const [siteSettingsAvailable, setSiteSettingsAvailable] = useState(true);
  const [savingContactSettings, setSavingContactSettings] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date | null>(null);
  const [sortBy, setSortBy] = useState<Record<Tab, string>>(defaultSortBy);
  const [sortDirection, setSortDirection] = useState<Record<Tab, SortDirection>>(defaultSortDirection);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshingContactInbox, setRefreshingContactInbox] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: Tab; id: string; label: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user && !loading) {
      navigate('/dashboard/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!section || !validTabs.includes(section as Tab)) {
      navigate('/dashboard/sectors', { replace: true });
      return;
    }

    setActiveTab(section as Tab);
  }, [section, navigate]);

  // Fetch companies, sectors and team
  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [companiesRes, sectorsRes, teamRes, testimonialsRes, servicesRes, casesRes, settingsRes, submissionsRes] = await Promise.all([
        supabase
          .from('s_companies')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true }),
        supabase
          .from('s_sectors')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true }),
        supabase
          .from('s_team')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true }),
        supabase
          .from('s_testimonials')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true }),
        supabase
          .from('s_services')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true }),
        supabase
          .from('s_cases')
          .select('*')
          .eq('is_active', true)
          .order('order_position', { ascending: true }),
        supabase
          .from('s_site_settings')
          .select('*')
          .eq('id', 1)
          .maybeSingle(),
        supabase
          .from('s_contact_submissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50),
      ]);

      if (companiesRes.error) throw companiesRes.error;
      if (sectorsRes.error) throw sectorsRes.error;
      if (teamRes.error) throw teamRes.error;
      if (testimonialsRes.error) throw testimonialsRes.error;
      if (servicesRes.error) throw servicesRes.error;
      if (casesRes.error) throw casesRes.error;
      if (submissionsRes.error) throw submissionsRes.error;
      
      setCompanies(companiesRes.data || []);
      setSectors(sectorsRes.data || []);
      setTeam(teamRes.data || []);
      setTestimonials(testimonialsRes.data || []);
      setServices(servicesRes.data || []);
      setCases(casesRes.data || []);
      setContactSubmissions((submissionsRes.data || []) as ContactSubmission[]);
      if (settingsRes.error) {
        if (isMissingSupabaseTableError(settingsRes.error)) {
          setSiteSettingsAvailable(false);
          setContactSettings({
            id: 1,
            whatsapp_number: '',
            whatsapp_enabled: true,
            whatsapp_message: 'Olá, vim pelo site da Metricaz e gostaria de conversar.',
            created_at: '',
            updated_at: '',
          });
        } else {
          throw settingsRes.error;
        }
      } else {
        setSiteSettingsAvailable(true);
        setContactSettings(
          settingsRes.data || {
            id: 1,
            whatsapp_number: '',
            whatsapp_enabled: true,
            whatsapp_message: 'Olá, vim pelo site da Metricaz e gostaria de conversar.',
            created_at: '',
            updated_at: '',
          },
        );
      }
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

  const handleLogout = async () => {
    await logout();
    navigate('/dashboard/login');
  };

  const handleTabChange = (tab: Tab) => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setSearchQuery('');
    setCurrentPage(1);
    navigate(`/dashboard/${tab}`);
  };

  const openDeleteDialog = (type: Tab, id: string) => {
    let label = 'registro';

    if (type === 'companies') {
      label = companies.find((company) => company.id === id)?.name || 'empresa';
    }

    if (type === 'sectors') {
      label = sectors.find((sector) => sector.id === id)?.name || 'setor';
    }

    if (type === 'team') {
      label = team.find((member) => member.id === id)?.name || 'membro';
    }

    if (type === 'testimonials') {
      label = testimonials.find((testimonial) => testimonial.id === id)?.name || 'depoimento';
    }

    if (type === 'services') {
      label = services.find((service) => service.id === id)?.title || 'serviço';
    }

    if (type === 'cases') {
      label = cases.find((caseItem) => caseItem.id === id)?.title || 'case';
    }

    if (type === 'whatsapp') {
      label = 'configuração de WhatsApp';
    }

    if (type === 'contact') {
      label = 'mensagem de contato';
    }

    setDeleteTarget({ type, id, label });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'whatsapp' || deleteTarget.type === 'contact') {
      toast.error('Essa seção não pode ser removida', {
        description: 'Use os campos do painel para alterar configurações e mensagens.',
      });
      setDeleteTarget(null);
      return;
    }

    const tableByType: Record<Tab, string> = {
      sectors: 's_sectors',
      companies: 's_companies',
      team: 's_team',
      testimonials: 's_testimonials',
      services: 's_services',
      cases: 's_cases',
      whatsapp: 's_site_settings',
      contact: 's_site_settings',
    };

    const labelByType: Record<Tab, string> = {
      sectors: 'setor',
      companies: 'empresa',
      team: 'membro do time',
      testimonials: 'depoimento',
      services: 'serviço',
      cases: 'case',
      whatsapp: 'configuração de WhatsApp',
      contact: 'mensagem de contato',
    };

    try {
      setIsDeleting(true);

      const { error } = await supabase
        .from(tableByType[deleteTarget.type])
        .update({ is_active: false })
        .eq('id', deleteTarget.id);

      if (error) throw error;

      if (deleteTarget.type === 'companies') {
        setCompanies((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      }

      if (deleteTarget.type === 'sectors') {
        setSectors((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      }

      if (deleteTarget.type === 'team') {
        setTeam((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      }

      if (deleteTarget.type === 'testimonials') {
        setTestimonials((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      }

      if (deleteTarget.type === 'services') {
        setServices((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      }

      if (deleteTarget.type === 'cases') {
        setCases((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      }

      toast.success('Item removido com sucesso', {
        description: `O ${labelByType[deleteTarget.type]} foi desativado com sucesso.`,
      });

      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting record:', error);
      toast.error('Nao foi possivel remover o item', {
        description: 'Tente novamente em instantes.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Company handlers
  const handleCompanyFormClose = () => {
    setShowCompanyForm(false);
    setEditingCompany(null);
  };

  const handleCompanyFormSuccess = () => {
    handleCompanyFormClose();
    fetchData();
  };

  // Sector handlers
  const handleSectorFormClose = () => {
    setShowSectorForm(false);
    setEditingSector(null);
  };

  const handleSectorFormSuccess = () => {
    handleSectorFormClose();
    fetchData();
  };

  // Team handlers
  const handleTeamFormClose = () => {
    setShowTeamForm(false);
    setEditingTeamMember(null);
  };

  const handleTeamFormSuccess = () => {
    handleTeamFormClose();
    fetchData();
  };

  // Testimonial handlers
  const handleTestimonialFormClose = () => {
    setShowTestimonialForm(false);
    setEditingTestimonial(null);
  };

  const handleTestimonialFormSuccess = () => {
    handleTestimonialFormClose();
    fetchData();
  };

  // Service handlers
  const handleServiceFormClose = () => {
    setShowServiceForm(false);
    setEditingService(null);
  };

  const handleServiceFormSuccess = () => {
    handleServiceFormClose();
    fetchData();
  };

  // Case handlers
  const handleCaseFormClose = () => {
    setShowCaseForm(false);
    setEditingCase(null);
  };

  const handleCaseFormSuccess = () => {
    handleCaseFormClose();
    fetchData();
  };

  const handleContactSettingsSave = async () => {
    try {
      if (!siteSettingsAvailable) {
        toast.error('A configuração de contato ainda não foi criada no banco', {
          description: 'Aplique o bloco `s_site_settings` de `database.sql` no Supabase e tente novamente.',
        });
        return;
      }

      setSavingContactSettings(true);

      const { error } = await supabase.from('s_site_settings').upsert({
        id: 1,
        whatsapp_number: contactSettings.whatsapp_number,
        whatsapp_enabled: contactSettings.whatsapp_enabled,
        whatsapp_message: contactSettings.whatsapp_message,
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      toast.success('Configurações salvas com sucesso');
      fetchData();
    } catch (error) {
      console.error('Error saving site settings:', error);
      toast.error('Nao foi possivel salvar as configuracoes', {
        description: 'Confira se a tabela `s_site_settings` já foi aplicada no banco.',
      });
    } finally {
      setSavingContactSettings(false);
    }
  };

  const handleRefreshContactInbox = async () => {
    try {
      setRefreshingContactInbox(true);
      const { data, error } = await supabase
        .from('s_contact_submissions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      setContactSubmissions((data || []) as ContactSubmission[]);
      toast.success('Caixa de entrada atualizada');
    } catch (error) {
      console.error('Error refreshing contact inbox:', error);
      toast.error('Nao foi possivel atualizar as mensagens');
    } finally {
      setRefreshingContactInbox(false);
    }
  };

  const sectionCount = {
    sectors: sectors.length,
    companies: companies.length,
    team: team.length,
    testimonials: testimonials.length,
    services: services.length,
    cases: cases.length,
    whatsapp: 1,
    contact: 1,
  };

  const currentSection = sections[activeTab];

  const openCreateForm = () => {
    if (activeTab === 'sectors') setShowSectorForm(true);
    if (activeTab === 'companies') setShowCompanyForm(true);
    if (activeTab === 'team') setShowTeamForm(true);
    if (activeTab === 'testimonials') setShowTestimonialForm(true);
    if (activeTab === 'services') setShowServiceForm(true);
    if (activeTab === 'cases') setShowCaseForm(true);
  };

  const handlePrimaryAction = () => {
    if (activeTab === 'whatsapp') {
      void handleContactSettingsSave();
      return;
    }

    if (activeTab === 'contact') {
      void handleRefreshContactInbox();
      return;
    }

    openCreateForm();
  };

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
    [testimonial.name, testimonial.role, testimonial.company, testimonial.testimonial]
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

  const filteredContact = contactSettings ? [contactSettings] : [];
  const filteredWhatsApp = contactSettings ? [contactSettings] : [];
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

      if (key === 'created_at') {
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

  const renderActiveList = () => {
    if (activeTab === 'whatsapp' || activeTab === 'contact') {
      return (
        <ContactSettingsForm
          whatsappNumber={contactSettings.whatsapp_number || ''}
          whatsappEnabled={contactSettings.whatsapp_enabled}
          whatsappMessage={contactSettings.whatsapp_message || ''}
          onWhatsappNumberChange={(value) =>
            setContactSettings((prev) => ({
              ...prev,
              whatsapp_number: value,
            }))
          }
          onWhatsappEnabledChange={(value) =>
            setContactSettings((prev) => ({
              ...prev,
              whatsapp_enabled: value,
            }))
          }
          onWhatsappMessageChange={(value) =>
            setContactSettings((prev) => ({
              ...prev,
              whatsapp_message: value,
            }))
          }
          onSave={handleContactSettingsSave}
          available={siteSettingsAvailable}
          saving={savingContactSettings}
        />
      );
    }

    if (activeTab === 'sectors') {
      return (
        <SectorList
          sectors={pagedSectors}
          onEdit={(sector) => {
            setEditingSector(sector);
            setShowSectorForm(true);
          }}
          onDelete={(id) => openDeleteDialog('sectors', id)}
        />
      );
    }

    if (activeTab === 'companies') {
      return (
        <CompanyList
          companies={pagedCompanies}
          onEdit={(company) => {
            setEditingCompany(company);
            setShowCompanyForm(true);
          }}
          onDelete={(id) => openDeleteDialog('companies', id)}
        />
      );
    }

    if (activeTab === 'team') {
      return (
        <TeamList
          team={pagedTeam}
          onEdit={(member) => {
            setEditingTeamMember(member);
            setShowTeamForm(true);
          }}
          onDelete={(id) => openDeleteDialog('team', id)}
        />
      );
    }

    if (activeTab === 'services') {
      return (
        <ServiceList
          services={pagedServices}
          onEdit={(service) => {
            setEditingService(service);
            setShowServiceForm(true);
          }}
          onDelete={(id) => openDeleteDialog('services', id)}
        />
      );
    }

    if (activeTab === 'cases') {
      return (
        <CaseList
          cases={pagedCases}
          onEdit={(caseItem) => {
            setEditingCase(caseItem);
            setShowCaseForm(true);
          }}
          onDelete={(id) => openDeleteDialog('cases', id)}
        />
      );
    }

    return (
      <TestimonialList
        testimonials={pagedTestimonials}
        onEdit={(testimonial) => {
          setEditingTestimonial(testimonial);
          setShowTestimonialForm(true);
        }}
        onDelete={(id) => openDeleteDialog('testimonials', id)}
      />
    );
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
                  {!sidebarCollapsed && (
                    <div className="rounded-2xl border border-primary/30 bg-primary/10 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ShieldCheck className="h-4 w-4 text-primary" />
                        Sessão ativa
                      </div>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email}</p>
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
                  <Button onClick={handlePrimaryAction} className="h-11 gap-2 px-5 text-sm">
                    <Plus className="h-4 w-4" />
                    {currentSection.actionLabel}
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
                <p className="mt-3 text-3xl font-semibold">{contactSettings.whatsapp_enabled ? 'Ativo' : 'Inativo'}</p>
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

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusao</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget
                ? `Tem certeza que deseja remover "${deleteTarget.label}"? Esta acao desativa o item no painel.`
                : 'Tem certeza que deseja remover este item?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Forms */}
      {showSectorForm && (
        <SectorForm 
          sector={editingSector}
          userId={user?.id}
          onClose={handleSectorFormClose}
          onSuccess={handleSectorFormSuccess}
        />
      )}

      {showCompanyForm && (
        <CompanyForm 
          company={editingCompany}
          userId={user?.id}
          onClose={handleCompanyFormClose}
          onSuccess={handleCompanyFormSuccess}
        />
      )}

      {showTeamForm && (
        <TeamForm 
          member={editingTeamMember}
          userId={user?.id}
          onClose={handleTeamFormClose}
          onSuccess={handleTeamFormSuccess}
        />
      )}

      {showTestimonialForm && (
        <TestimonialForm 
          testimonial={editingTestimonial}
          userId={user?.id}
          onClose={handleTestimonialFormClose}
          onSuccess={handleTestimonialFormSuccess}
        />
      )}

      {showServiceForm && (
        <ServiceForm
          service={editingService}
          userId={user?.id}
          onClose={handleServiceFormClose}
          onSuccess={handleServiceFormSuccess}
        />
      )}

      {showCaseForm && (
        <CaseForm
          caseItem={editingCase}
          userId={user?.id}
          onClose={handleCaseFormClose}
          onSuccess={handleCaseFormSuccess}
        />
      )}
    </div>
  );
};
