import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTestimonials } from "@/hooks/useTestimonials";
import { OptionText } from "@/components/site/OptionText";
import { useSiteOptions } from "@/hooks/useSiteOptions";
import { buildStats } from "@/lib/stats";

const AUTOPLAY_MS = 10000;
// "Em números" panel: numbers from "Opções do site" (value = number, text = its label).
const SPLIT_STATS = [
  { key: "marcasatendidas", prefix: "+" },
  { key: "idade" },
  { key: "receitaorganica", prefix: "+", suffix: "%" },
];

export const StatsSplit = () => {
  // Known only in the browser (set on mount), so the server and the first client render match.
  const [isMobile, setIsMobile] = useState(false);
  const { testimonials: testimonialsData } = useTestimonials({ placement: 'client_panel' });
  const { options, labels } = useSiteOptions();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener?.("change", updateViewport);

    return () => mediaQuery.removeEventListener?.("change", updateViewport);
  }, []);

  const testimonials = testimonialsData.map((t) => ({
    q: `"${t.text}"`,
    name: t.name,
    role: `${t.role} · ${t.company}`,
    initials: t.name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase(),
  }));

  const stats = buildStats(SPLIT_STATS, options, labels);

  const [i, setI] = useState(0);
  const go = (dir: number) =>
    setI((prev) => (prev + dir + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (isMobile || testimonials.length <= 1) return;

    const id = setInterval(() => setI((p) => (p + 1) % testimonials.length), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [isMobile, testimonials.length]);

  // Each panel only exists with data (client testimonials / numbers); a lone panel takes the full width.
  const t = testimonials.length > 0 ? testimonials[i % testimonials.length] : null;
  const hasStats = stats.length > 0;

  if (!t && !hasStats) {
    return null;
  }

  return (
    <section className="grid md:grid-cols-12 border-y border-border">
      {/* Depoimentos — laranja com carrossel */}
      {t && (
      <div className={`${hasStats ? "md:col-span-5" : "md:col-span-12"} surface-orange p-10 md:p-14 flex flex-col justify-between min-h-[420px] relative`}>
        <div>
          <div className="flex items-center justify-between mb-6">
            <OptionText k="statssplit.client_eyebrow" as="div" className="mono-tag text-primary-foreground/80" />
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
      )}

      {/* Stats — ink deep */}
      {hasStats && (
      <div className={`${t ? "md:col-span-7" : "md:col-span-12"} bg-ink-deep p-10 md:p-14 flex flex-col justify-between min-h-[420px]`}>
        <div>
          <OptionText k="statssplit.numbers_eyebrow" as="div" className="mono-tag text-muted-foreground mb-6" />
          <OptionText
            k="statssplit.numbers_title"
            as="h3"
            className="editorial text-3xl md:text-5xl max-w-lg leading-tight"
            accentClassName="editorial-italic text-primary"
          />
        </div>
        <div className="grid grid-cols-3 gap-6 mt-10 pt-10 border-t border-border">
          {stats.map((s) => (
            <div key={s.key}>
              <div className="editorial text-4xl md:text-6xl text-foreground">{s.value}</div>
              <div className="mono-tag text-muted-foreground mt-3">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      )}
    </section>
  );
};
