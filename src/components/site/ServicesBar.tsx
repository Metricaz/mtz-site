import { Search, MousePointerClick, BarChart3, Radio, Code2, LineChart } from "lucide-react";

const items = [
  { icon: Search, label: "SEO Técnico" },
  { icon: MousePointerClick, label: "CRO & A/B" },
  { icon: BarChart3, label: "GA4 + GTM" },
  { icon: Radio, label: "Server-Side" },
  { icon: LineChart, label: "BI & Dashboards" },
  { icon: Code2, label: "Desenvolvimento" },
];

export const ServicesBar = () => {
  return (
    <div className="surface-orange border-y border-primary-foreground/10">
      <div className="container-x">
        <ul className="grid grid-cols-2 md:grid-cols-6 divide-x divide-primary-foreground/15">
          {items.map(({ icon: Icon, label }, i) => (
            <li
              key={label}
              className={`flex items-center gap-3 px-4 md:px-5 py-5 ${
                i >= 2 ? "border-t md:border-t-0 border-primary-foreground/15" : ""
              }`}
            >
              <Icon className="w-4 h-4 text-primary-foreground shrink-0" strokeWidth={2} />
              <span className="mono-tag text-primary-foreground">{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
