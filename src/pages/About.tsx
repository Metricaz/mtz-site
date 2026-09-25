import { Nav } from "@/components/site/Nav";
import { FooterCTA } from "@/components/site/FooterCTA";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { useTeam } from "@/hooks/useTeam";
import { useTestimonials } from "@/hooks/useTestimonials";
import { OptionText } from "@/components/site/OptionText";
import { useApiList } from "@/hooks/useApiList";
import { useSiteImage } from "@/hooks/useSiteImage";
import { useSiteOptions } from "@/hooks/useSiteOptions";
import { AboutHighlight, AboutPillar } from "@/lib/api-types";
import { buildStats } from "@/lib/stats";

// Numbers grid: numbers from "Opções do site" (value = number, text = its label).
const ABOUT_STATS = [
  { key: "marcasatendidas", prefix: "+" },
  { key: "idade", suffix: " anos" },
  { key: "ganhoprojetos", prefix: "+", suffix: "%" },
  { key: "confiabilidadecoleta", suffix: "%" },
];

const About = () => {
  const { team: leads } = useTeam({ placement: "about" });
  // Only one testimonial is shown here: the first flagged "destaque do Quem Somos", by position.
  const { testimonials } = useTestimonials({ placement: "about" });
  const highlightedTestimonial = testimonials[0];
  const whatWeDo = useApiList<AboutPillar>("/about-pillars/");
  const highlights = useApiList<AboutHighlight>("/about-highlights/");
  const whyImage = useSiteImage("about.why_image");
  const { options, labels } = useSiteOptions();
  const stats = buildStats(ABOUT_STATS, options, labels);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav useHomeSectionLinks />

      <section className="relative overflow-hidden border-b border-border bg-ink-deep pb-16 pt-28 md:pb-20 md:pt-36">
        <div className="pointer-events-none absolute inset-0 bg-gradient-radial" />
        <div className="container-x relative">
          <OptionText k="about.eyebrow" as="p" className="mono-tag text-muted-foreground" />
          <OptionText
            k="about.title"
            as="h1"
            className="editorial mt-6 text-[clamp(2.5rem,7vw,6rem)] leading-[0.94]"
            accentClassName="editorial-italic text-primary"
          />
          <OptionText k="about.description" as="p" className="mt-6 max-w-3xl text-base text-foreground/80 md:text-lg" />
        </div>
      </section>

      <section className="relative overflow-hidden border-b border-border bg-[#111019] py-20 md:py-28">
        <div className="container-x relative">
          <div className="mb-12 flex items-end justify-between gap-6">
            <div>
              <OptionText k="about.whatwedo_eyebrow" as="div" className="eyebrow" />
              <OptionText
                k="about.whatwedo_title"
                as="h2"
                className="editorial mt-4 text-4xl md:text-6xl"
                accentClassName="editorial-italic text-primary"
              />
            </div>
          </div>

          {whatWeDo.length > 0 && (
          <div className="flex flex-col gap-4 md:h-[430px] md:flex-row">
            {whatWeDo.map((item) => (
              <article
                key={item.id}
                className="group relative min-h-[320px] overflow-hidden rounded-3xl border border-border bg-card md:flex-1 md:transition-all md:duration-500 md:ease-out md:hover:flex-[1.45]"
              >
                <img src={item.image} alt={item.image_alt || item.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/35 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="mono-tag text-primary">{item.tag}</p>
                  <h3 className="mt-2 text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 max-w-md text-sm text-foreground/80">{item.text}</p>
                </div>
              </article>
            ))}
          </div>
          )}

          {stats.length > 0 && (
          <div className="mt-10 grid gap-4 md:grid-cols-4">
            {stats.map((item) => (
              <div key={item.key} className="rounded-2xl border border-border/80 bg-card/55 p-5">
                <p className="editorial text-4xl text-primary md:text-5xl">{item.value}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.label}</p>
              </div>
            ))}
          </div>
          )}
        </div>
      </section>

      <section className="surface-cream py-20 text-cream-foreground md:py-28">
        <div className={`container-x grid gap-8 lg:items-center ${whyImage ? "lg:grid-cols-[1.1fr_1fr]" : ""}`}>
          {whyImage && (
            <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-cream">
              <img src={whyImage.image} alt={whyImage.alt} className="h-full min-h-[320px] w-full object-cover" />
            </div>
          )}

          <div>
            <OptionText k="about.why_eyebrow" as="div" className="eyebrow" />
            <OptionText
              k="about.why_title"
              as="h2"
              className="mt-4 font-display text-4xl font-semibold leading-tight text-cream-foreground md:text-6xl"
              accentClassName="editorial-italic text-primary"
            />
            <OptionText k="about.why_description" as="p" className="mt-5 max-w-xl text-base text-cream-foreground/80 md:text-lg" />

            {highlights.length > 0 && (
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {highlights.map((item) => (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-white/70 p-4 shadow-cream backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white hover:shadow-[0_24px_50px_-28px_rgba(17,16,25,0.35)]"
                >
                  <div className="pointer-events-none absolute right-3 top-3 h-2 w-2 rounded-full bg-primary/40 transition-all duration-300 group-hover:scale-125 group-hover:bg-primary" />
                  <h3 className="font-semibold text-cream-foreground transition-colors duration-300 group-hover:text-primary">{item.title}</h3>
                  <p className="mt-2 text-sm text-cream-foreground/75 transition-colors duration-300 group-hover:text-cream-foreground/90">{item.text}</p>
                </article>
              ))}
            </div>
            )}
          </div>
        </div>
      </section>

      {leads.length > 0 && (
      <section className="relative overflow-hidden border-y border-border bg-ink-deep py-20 md:py-28">
        <div className="container-x relative">
          <div className="mb-12">
            <div>
              <OptionText k="about.leads_eyebrow" as="div" className="eyebrow" />
              <OptionText
                k="about.leads_title"
                as="h2"
                className="editorial mt-4 text-4xl md:text-6xl"
                accentClassName="editorial-italic text-primary"
              />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {leads.map((member, idx) => (
              <article
                key={`${member.name}-${idx}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-border bg-ink"
              >
                {member.photo ? (
                  <>
                    <img
                      src={member.photo}
                      alt={member.photo_alt || member.name}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      style={{
                        filter: "grayscale(100%) hue-rotate(200deg) saturate(0.6) brightness(1.1) contrast(1.1)",
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-deep/45 to-ink-deep" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-ink-soft via-ink to-ink-deep" />
                    <div className="absolute inset-x-0 top-1/4 flex justify-center">
                      <div className="grid h-40 w-40 place-items-center rounded-full bg-ink-soft">
                        <span className="editorial text-5xl text-primary/40">
                          {member.name
                            .split(" ")
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join("")
                            .toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink-deep via-ink-deep/80 to-transparent p-6 md:p-8">
                  <h3 className="editorial text-2xl text-foreground md:text-3xl">{member.name}</h3>
                  <p className="mono-tag mt-2 text-muted-foreground">{member.role}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      )}

      {highlightedTestimonial && (
      <section className="surface-cream py-20 md:py-28">
        <div className="container-x text-center">
          <OptionText k="about.testimonial_eyebrow" as="div" className="eyebrow" />
          <blockquote className="mx-auto mt-6 max-w-4xl text-balance font-display text-3xl leading-tight text-cream-foreground md:text-5xl">
            “
            {highlightedTestimonial.text}
            ”
          </blockquote>
          <p className="mt-7 text-lg font-semibold text-cream-foreground">
            {highlightedTestimonial.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {highlightedTestimonial.role} · {highlightedTestimonial.company}
          </p>
        </div>
      </section>
      )}

      <FooterCTA />
      <Contact />
      <Footer useHomeSectionLinks />
    </main>
  );
};

export default About;
