import {
  Activity,
  BarChart3,
  BadgeCheck,
  Blocks,
  Brain,
  Bug,
  Code2,
  Cpu,
  LayoutDashboard,
  LineChart,
  MousePointerClick,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Workflow,
} from 'lucide-react';
import { SiteService } from './types';

export const SERVICE_ICON_OPTIONS = [
  { value: 'seo', label: 'SEO', icon: Search },
  { value: 'cro', label: 'CRO & Testes A/B', icon: MousePointerClick },
  { value: 'analytics', label: 'Digital Analytics', icon: BarChart3 },
  { value: 'development', label: 'Desenvolvimento', icon: Code2 },
  { value: 'strategy', label: 'Estratégia', icon: Brain },
  { value: 'automation', label: 'Automação', icon: Workflow },
  { value: 'dashboards', label: 'Dashboards', icon: LayoutDashboard },
  { value: 'data-quality', label: 'Qualidade de dados', icon: BadgeCheck },
  { value: 'tracking', label: 'Tagueamento', icon: ShieldCheck },
  { value: 'performance', label: 'Performance', icon: LineChart },
  { value: 'ops', label: 'Operações', icon: Blocks },
  { value: 'engineering', label: 'Engenharia', icon: Cpu },
  { value: 'testing', label: 'Testes', icon: Bug },
  { value: 'growth', label: 'Growth', icon: Rocket },
  { value: 'signal', label: 'Sinal & Métrica', icon: Activity },
] as const;

export type ServiceIconName = (typeof SERVICE_ICON_OPTIONS)[number]['value'];

export const getServiceIcon = (iconName?: string) => {
  return SERVICE_ICON_OPTIONS.find((option) => option.value === iconName)?.icon || Sparkles;
};

export const getServiceIconLabel = (iconName?: string) => {
  return SERVICE_ICON_OPTIONS.find((option) => option.value === iconName)?.label || 'Serviço';
};

export const DEFAULT_SERVICE_CONTENT = `
<h2>Visão geral</h2>
<p>Descreva aqui o que esse serviço resolve, para quem ele existe e qual transformação ele entrega.</p>
<h3>O que entregamos</h3>
<ul>
  <li>Diagnóstico do cenário atual</li>
  <li>Plano de ação priorizado</li>
  <li>Implementação e acompanhamento</li>
</ul>
<h3>Como trabalhamos</h3>
<p>Combine estratégia, execução e acompanhamento contínuo para sustentar resultados reais no tempo.</p>
`;

export const DEFAULT_SERVICES: SiteService[] = [
  {
    id: 'seo-default',
    title: 'SEO',
    slug: 'seo',
    icon_name: 'seo',
    excerpt: 'Auditoria técnica, estratégia de conteúdo e link building com foco em crescimento orgânico previsível.',
    content_html: `
      <h2>SEO orientado a negócio</h2>
      <p>Estruturamos a presença orgânica para gerar demanda qualificada, apoiar a jornada de compra e ampliar previsibilidade de receita.</p>
      <h3>Frentes de atuação</h3>
      <ul>
        <li>Auditoria técnica e correção de gargalos</li>
        <li>Arquitetura de conteúdo e clusters temáticos</li>
        <li>Estratégia de autoridade e desempenho orgânico</li>
      </ul>
    `,
    order_position: 0,
    is_active: true,
    created_by: 'seed',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'cro-default',
    title: 'CRO & Testes A/B',
    slug: 'cro',
    icon_name: 'cro',
    excerpt: 'Hipóteses baseadas em dados, experimentação contínua e otimização da jornada de conversão.',
    content_html: `
      <h2>Conversão com método</h2>
      <p>Testamos, priorizamos e ajustamos a experiência para transformar mais tráfego em resultado real.</p>
      <h3>Frentes de atuação</h3>
      <ul>
        <li>Auditoria de UX e comportamento</li>
        <li>Hipóteses ICE e roadmap de testes</li>
        <li>Experimentação e leitura estatística</li>
      </ul>
    `,
    order_position: 1,
    is_active: true,
    created_by: 'seed',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'analytics-default',
    title: 'Digital Analytics',
    slug: 'analytics',
    icon_name: 'analytics',
    excerpt: 'Mensuração ponta a ponta com GA4, GTM, server-side tracking e dashboards acionáveis.',
    content_html: `
      <h2>Mensuração confiável</h2>
      <p>Construímos uma base de dados clara para que marketing, produto e liderança tomem decisão com segurança.</p>
      <h3>Frentes de atuação</h3>
      <ul>
        <li>Setup e migração para GA4</li>
        <li>Tagueamento e governança</li>
        <li>Integração com mídia e BI</li>
      </ul>
    `,
    order_position: 2,
    is_active: true,
    created_by: 'seed',
    created_at: '',
    updated_at: '',
  },
  {
    id: 'development-default',
    title: 'Desenvolvimento',
    slug: 'desenvolvimento',
    icon_name: 'development',
    excerpt: 'Software sob medida, integrações e automações que sustentam a operação data-driven.',
    content_html: `
      <h2>Produto e automação</h2>
      <p>Desenvolvemos camadas técnicas que conectam sistemas, simplificam fluxos e sustentam operações mais inteligentes.</p>
      <h3>Frentes de atuação</h3>
      <ul>
        <li>Integrações com APIs e dados</li>
        <li>Web apps e ferramentas internas</li>
        <li>Automação de processos e relatórios</li>
      </ul>
    `,
    order_position: 3,
    is_active: true,
    created_by: 'seed',
    created_at: '',
    updated_at: '',
  },
];