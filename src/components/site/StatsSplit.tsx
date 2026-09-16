import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";

const fallbackTestimonials = [
  {
    q: '"A Metricaz levou nossa operação de analytics a outro nível. Decisões viraram dado, não opinião."',
    name: "Marina Costa",
    role: "Head of Growth · Whirlpool",
    initials: "MC",
  },
  {
    q: '"Precisão técnica + visão de negócio. Em 6 meses dobramos a conversão do nosso e-commerce."',
    name: "Lucas Andrade",
    role: "CMO · Veloe",
    initials: "LA",
  },
  {
    q: '"O time é cirúrgico. Implementação de GA4 e server-side impecável, sem gambiarra."',
    name: "Renata Silva",
    role: "Diretora Digital · Claro",
    initials: "RS",
  },
];

const AUTOPLAY_MS = 10000;

export const StatsSplit = () => {
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  const { testimonials: testimonialsData } = useTestimonials({ section: 'clients' });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener?.("change", updateViewport);

    return () => mediaQuery.removeEventListener?.("change", updateViewport);
  }, []);

  // Use dynamic data if available, otherwise use fallback
  const testimonials = testimonialsData.length > 0 
    ? testimonialsData.map(t => ({
        q: `"${t.testimonial}"`,
        name: t.name,
        role: `${t.role} · ${t.company}`,
        initials: t.name
          .split(" ")
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase(),
      }))
    : fallbackTestimonials;

  const stats = [
    { k: "+80", v: "Marcas atendidas" },
    { k: "12", v: "Anos de método" },
    { k: "+312%", v: "Receita orgânica média" },
  ];

  const [i, setI] = useState(0);
  const go = (dir: number) =>
    setI((prev) => (prev + dir + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (isMobile || testimonials.length <= 1) return;

    const id = setInterval(() => setI((p) => (p + 1) % testimonials.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isMobile, testimonials.length]);

  const t = testimonials[i];

  return (
    <section className="grid md:grid-cols-12 border-y border-border">
      {/* Depoimentos — laranja com carrossel */}
      <div className="md:col-span-5 surface-orange p-10 md:p-14 flex flex-col justify-between min-h-[420px] relative">
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="mono-tag text-primary-foreground/80">{"// Cliente"}</div>
            <div className="flex items-center gap-2">
              <button
                aria-label="Anterior"
                onClick={() => go(-1)}
                className="w-9 h-9 rounded-full border border-primary-foreground/30 hover:bg-primary-foreground hover:text-primary transition-colors grid place-items-center text-primary-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                aria-label="Próximo"
                onClick={() => go(1)}
                className="w-9 h-9 rounded-full border border-primary-foreground/30 hover:bg-primary-foreground hover:text-primary transition-colors grid place-items-center text-primary-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          <blockquote
            key={i}
            className="editorial text-2xl md:text-3xl leading-tight text-primary-foreground animate-fade-in"
          >
            {t.q}
          </blockquote>
        </div>

        <div className="mt-10">
          <figcaption className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-foreground/15 grid place-items-center font-semibold text-primary-foreground">
              {t.initials}
            </div>
            <div>
              <div className="font-semibold text-primary-foreground">{t.name}</div>
              <div className="mono-tag text-primary-foreground/70 mt-1">{t.role}</div>
            </div>
          </figcaption>

          {/* dots */}
          <div className="flex items-center gap-2 mt-6">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                aria-label={`Depoimento ${idx + 1}`}
                onClick={() => setI(idx)}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-8 bg-primary-foreground" : "w-4 bg-primary-foreground/35"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Stats — ink deep */}
      <div className="md:col-span-7 bg-ink-deep p-10 md:p-14 flex flex-col justify-between min-h-[420px]">
        <div>
          <div className="mono-tag text-muted-foreground mb-6">{"// Em números"}</div>
          <h3 className="editorial text-3xl md:text-5xl max-w-lg leading-tight">
            Mais de <span className="editorial-italic text-primary">uma década</span>{" "}
            construindo operações data-driven.
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-border">
          {stats.map((s) => (
            <div key={s.v}>
              <div className="editorial text-4xl md:text-6xl text-foreground">{s.k}</div>
              <div className="mono-tag text-muted-foreground mt-3">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
