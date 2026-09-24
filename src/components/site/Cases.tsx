import { Link } from "react-router-dom";
import { useCases } from "@/hooks/useCases";

const spans = [
  "md:col-span-8 aspect-[16/10]",
  "md:col-span-4 aspect-[4/5]",
  "md:col-span-5 aspect-[5/4]",
  "md:col-span-7 aspect-[16/9]",
  "md:col-span-6 aspect-[5/4]",
  "md:col-span-6 aspect-[5/4]",
];

export const Cases = () => {
  const { cases, loading } = useCases({ limit: 6 });

  if (!loading && cases.length === 0) {
    return null;
  }

  return (
    <section id="cases" className="py-24 md:py-36">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-20">
          <div>
            <div className="eyebrow">{"// Cases selecionados"}</div>
            <h2 className="editorial mt-5 text-5xl md:text-8xl">
              Projetos que{" "}
              <span className="editorial-italic text-primary">movem</span>{" "}
              <span className="editorial-italic">negócios.</span>
            </h2>
          </div>
          <a href="#contato" className="mono-tag text-muted-foreground hover:text-primary inline-flex items-center gap-2 self-start md:self-end">
            Todos os cases <span>→</span>
          </a>
        </div>

        <div className="grid md:grid-cols-12 gap-4 md:gap-6">
          {loading && Array.from({ length: 3 }, (_, i) => (
            <div key={i} className={`rounded-3xl border border-border bg-card/40 animate-pulse ${spans[i % spans.length]}`} />
          ))}
          {!loading && cases.map((c, i) => {
            return (
            <Link
              key={c.id}
              to={`/cases/${c.slug}`}
              className={`group relative rounded-3xl overflow-hidden border border-border bg-card block ${spans[i % spans.length]}`}
            >
              <img
                src={c.featured_image}
                alt={c.featured_image_alt || c.title}
                width={1024}
                height={768}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/55 to-ink-deep/5" />
              <div className="absolute inset-0 p-6 md:p-8 flex flex-col justify-between">
                <div className="flex items-start justify-between gap-4">
                  <span className="mono-tag px-3 py-1.5 rounded-full bg-primary text-primary-foreground">
                    {c.tag}
                  </span>
                  <div className="text-right">
                    <div className="editorial text-3xl md:text-5xl text-primary leading-none">{c.kpi_value}</div>
                    <div className="mono-tag text-foreground/70 mt-2">{c.kpi_label}</div>
                  </div>
                </div>
                <div className="max-w-xl">
                  <h3 className="editorial text-3xl md:text-5xl text-foreground">{c.title}</h3>
                  <p className="text-foreground/80 mt-2 text-sm md:text-base max-w-md">{c.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Ver case
                    <span className="transition-transform group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
};
