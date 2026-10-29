import { Link } from "react-router-dom";
import { Case } from "@/lib/api-types";
import { useCases } from "@/hooks/useCases";
import { OptionText } from "@/components/site/OptionText";
import { SHOW_CASE_NUMBERS } from "@/lib/stats";

const spans = [
  "md:col-span-8 aspect-[16/10]",
  "md:col-span-4 aspect-[4/5]",
  "md:col-span-5 aspect-[5/4]",
  "md:col-span-7 aspect-[16/9]",
  "md:col-span-6 aspect-[5/4]",
  "md:col-span-6 aspect-[5/4]",
];

type CaseGridProps = {
  cases: Case[];
  /** Card title level: h3 under the home section's h2, h2 right under the /cases page h1. */
  headingLevel?: "h2" | "h3";
};

/** Case cards in the mosaic layout: home "Cases" section and the /cases page. */
export const CaseGrid = ({ cases, headingLevel: Heading = "h3" }: CaseGridProps) => (
  <div className="grid md:grid-cols-12 gap-4 md:gap-6">
    {cases.map((c, i) => (
      <Link
        key={c.id}
        to={`/cases/${c.slug}`}
        className={`group relative flex flex-col self-stretch rounded-3xl border border-border bg-card ${spans[i % spans.length]}`}
      >
        {/* The aspect ratio is a minimum: a long title or summary makes the card taller instead of being cut off. */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <img
            src={c.featured_image}
            alt={c.featured_image_alt || c.title}
            width={1024}
            height={768}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/55 to-ink-deep/5" />
        </div>
        <div className="relative flex flex-1 flex-col justify-between gap-8 p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <span className="mono-tag px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
              {c.tag}
            </span>
            {SHOW_CASE_NUMBERS && (
              <div className="text-right">
                <div className="editorial text-3xl md:text-5xl text-primary leading-none">{c.kpi_value}</div>
                <div className="mono-tag text-foreground/70 mt-2">{c.kpi_label}</div>
              </div>
            )}
          </div>
          <div className="max-w-xl">
            <Heading className="editorial text-3xl md:text-4xl xl:text-5xl text-foreground">{c.title}</Heading>
            <p className="text-foreground/80 mt-2 text-sm md:text-base max-w-md">{c.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
              Ver case
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </span>
          </div>
        </div>
      </Link>
    ))}
  </div>
);

export const Cases = () => {
  const { cases } = useCases({ limit: 6 });

  if (cases.length === 0) {
    return null;
  }

  return (
    <section id="cases" className="py-24 md:py-36">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-20">
          <div>
            <OptionText k="cases.eyebrow" as="div" className="eyebrow" />
            <OptionText
              k="cases.title"
              as="h2"
              className="editorial mt-5 text-5xl md:text-8xl"
              accentClassName="editorial-italic text-primary"
            />
          </div>
          <Link to="/cases" className="mono-tag text-muted-foreground hover:text-primary inline-flex items-center gap-2 self-start md:self-end">
            Todos os cases <span>→</span>
          </Link>
        </div>

        <CaseGrid cases={cases} />
      </div>
    </section>
  );
};
