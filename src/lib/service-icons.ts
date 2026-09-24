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

export const getServiceIcon = (iconName?: string) => {
  return SERVICE_ICON_OPTIONS.find((option) => option.value === iconName)?.icon || Sparkles;
};
