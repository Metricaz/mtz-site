import { useTestimonials } from "@/hooks/useTestimonials";
import { OptionText } from "@/components/site/OptionText";

export const Testimonials = () => {
  const { testimonials: testimonialsData } = useTestimonials({ placement: 'testimonials' });

  if (testimonialsData.length === 0) {
    return null;
  }

  const items = testimonialsData.map((t) => ({
    q: t.text,
    a: t.name,
    r: `${t.role} · ${t.company}`,
  }));

  return (
    <section className="surface-cream py-24 md:py-36">
      <div className="container-x">
        <div className="grid md:grid-cols-12 items-end gap-10 mb-16">
          <div className="md:col-span-8">
            <OptionText k="testimonials.eyebrow" as="div" className="eyebrow" />
            <OptionText
              k="testimonials.title"
              as="h2"
              className="editorial mt-5 text-5xl md:text-7xl text-cream-foreground"
              accentClassName="editorial-italic text-primary"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-3 border-t border-cream-foreground/15">
          {items.map((t, i) => (
            <figure
              key={i}
              className={`py-10 md:py-14 md:px-10 flex flex-col gap-8 ${
                i > 0 ? "md:border-l border-cream-foreground/15" : ""
              } ${i > 0 ? "border-t md:border-t-0 border-cream-foreground/15" : ""}`}
            >
              <span className="editorial text-8xl text-primary leading-none -mb-6">"</span>
              <blockquote className="editorial text-2xl md:text-3xl text-cream-foreground leading-tight">
                {t.q}
              </blockquote>
              <figcaption className="mt-auto pt-6 border-t border-cream-foreground/15">
                <div className="font-semibold text-cream-foreground">{t.a}</div>
                <div className="mono-tag mt-1.5" style={{ color: "hsl(248 14% 38%)" }}>{t.r}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};
