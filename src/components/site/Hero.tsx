import { OptionText } from "@/components/site/OptionText";
import { useSiteOptions } from "@/hooks/useSiteOptions";
import { buildStats } from "@/lib/stats";

// KPI band: numbers from "Opções do site" (value = number, text = its label).
const HERO_STATS = [
  { key: "receitaorganica", prefix: "+", suffix: "%" },
  { key: "liftcro", suffix: "×" },
  { key: "marcasatendidas", prefix: "+" },
  { key: "idade", suffix: " anos" },
];

export const Hero = () => {
  const { options, labels } = useSiteOptions();
  const stats = buildStats(HERO_STATS, options, labels);

  return (
    <section id="top" className="relative pt-32 md:pt-40 pb-20 md:pb-28 overflow-hidden noise">
      <div className="absolute inset-0 bg-gradient-radial pointer-events-none" />

      <div className="container-x relative">
        {/* meta row */}
        <div className="rise flex items-center justify-end mb-10 md:mb-16">
          <OptionText k="hero.location" className="mono-tag text-muted-foreground hidden md:block" />
        </div>

        {/* headline */}
        <OptionText
          k="hero.title"
          as="h1"
          className="rise editorial text-foreground text-[clamp(2.75rem,10vw,9rem)]"
          accentClassName="editorial-italic"
        />

        {/* sub row */}
        <div className="rise-2 mt-12 md:mt-16 grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-6">
            <div className="hairline-orange w-16 mb-5" />
            <OptionText
              k="hero.subtitle"
              as="p"
              className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-lg"
              accentClassName="text-foreground font-medium"
            />
          </div>

          <div className="md:col-span-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <a
              href="#contato"
              className="group inline-flex items-center justify-center gap-2 px-7 h-14 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary-glow transition-colors"
            >
              Iniciar um projeto
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#cases"
              className="inline-flex items-center justify-center gap-2 px-7 h-14 rounded-full border border-border bg-card/40 backdrop-blur text-foreground hover:border-primary hover:text-primary transition-colors"
            >
              Ver cases
            </a>
          </div>
        </div>

        {/* KPI band — editorial, no AI image */}
        {stats.length > 0 && (
        <div className="rise-3 mt-20 md:mt-28 grid grid-cols-2 md:grid-cols-4 border-t border-border">
          {stats.map(({ key, value: k, label: v }, i) => (
            <div
              key={key}
              className={`py-8 md:py-10 px-2 md:px-6 ${i > 0 ? "md:border-l border-border" : ""} ${i === 2 ? "border-l md:border-l border-border" : ""} ${i === 1 ? "border-l border-border" : ""}`}
            >
              <div className="editorial text-5xl md:text-7xl text-foreground">{k}</div>
              <div className="mono-tag text-muted-foreground mt-3">{v}</div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  );
};
