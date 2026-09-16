import { Compass, Target, Rocket, LineChart } from "lucide-react";

export const Method = () => {
  const steps = [
    {
      n: "01",
      icon: Compass,
      t: "Diagnóstico",
      d: "Auditoria de stack, dados e funil. Identificamos os gargalos reais antes de propor qualquer ação.",
      tags: ["Stack audit", "Data quality", "Funnel review"],
    },
    {
      n: "02",
      icon: Target,
      t: "Estratégia",
      d: "Roadmap priorizado por impacto, com hipóteses, KPIs claros e responsabilidades definidas.",
      tags: ["Roadmap", "OKRs", "Hipóteses"],
    },
    {
      n: "03",
      icon: Rocket,
      t: "Execução",
      d: "Times integrados executando em sprints, com rituais de QA e governança técnica.",
      tags: ["Sprints", "QA", "Governança"],
    },
    {
      n: "04",
      icon: LineChart,
      t: "Mensuração",
      d: "Dashboards vivos, leitura de resultados e iteração contínua sobre o que importa.",
      tags: ["Dashboards", "Iteração", "Insights"],
    },
  ];

  return (
    <section id="metodo" className="surface-cream relative py-24 md:py-36">
      <div className="container-x">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-16 md:mb-20">
          <div className="md:col-span-8">
            <div className="eyebrow">{"// Método"}</div>
            <h2 className="editorial mt-5 text-5xl md:text-8xl text-cream-foreground">
              Um workflow{" "}
              <span className="editorial-italic text-primary">simples e estratégico.</span>
            </h2>
          </div>
          <p className="md:col-span-4 text-lg leading-relaxed" style={{ color: "hsl(248 14% 38%)" }}>
            Conformidade com LGPD, governança e um método transparente. Você sabe sempre o que
            está sendo medido, como e por quê.
          </p>
        </div>

        <div className="border-t border-cream-foreground/15">
          {steps.map(({ n, icon: Icon, t, d, tags }, i) => (
            <div
              key={n}
              className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-14 border-b border-cream-foreground/15 items-center"
            >
              {/* icon tile */}
              <div className="md:col-span-2">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-cream-deep grid place-items-center border border-cream-foreground/10 group-hover:bg-primary group-hover:border-primary transition-colors">
                  <Icon className="w-8 h-8 text-cream-foreground group-hover:text-primary-foreground transition-colors" strokeWidth={1.6} />
                </div>
              </div>

              {/* number */}
              <div className="md:col-span-3">
                <div className="editorial text-8xl md:text-[10rem] text-primary leading-none">
                  {n}
                </div>
              </div>

              {/* content */}
              <div className="md:col-span-5">
                <h3 className="editorial text-3xl md:text-5xl text-cream-foreground">{t}</h3>
                <p className="mt-4 text-base md:text-lg leading-relaxed max-w-md" style={{ color: "hsl(248 14% 38%)" }}>
                  {d}
                </p>
              </div>

              {/* tags */}
              <div className="md:col-span-2 flex md:flex-col flex-wrap gap-2 md:items-end">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="mono-tag px-3 py-1.5 rounded-full border border-cream-foreground/20 text-cream-foreground/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-primary pulse-dot" />
          <span className="mono-tag text-cream-foreground">LGPD · Consent Mode v2 · Server-side</span>
        </div>
      </div>
    </section>
  );
};
