import { useCompanies } from '@/hooks/useCompanies';
import { useSiteOptions } from '@/hooks/useSiteOptions';
import { useState } from 'react';

export const Logos = () => {
  const { companies } = useCompanies();
  const { options, labels } = useSiteOptions();
  const [isPaused, setIsPaused] = useState(false);

  if (companies.length === 0) {
    return null;
  }

  const brandsCount = options['marcasatendidas'];

  // Duplicar items para efeito de loop infinito
  const items = [...companies, ...companies];

  return (
    <section className="py-20 md:py-24 border-b border-border">
      <div className="container-x mb-10 flex items-end justify-between">
        <div>
          <p className="eyebrow">{"// Quem confia"}</p>
          <p className="editorial mt-4 text-3xl md:text-5xl max-w-xl">
            Marcas que decidem com{" "}
            <span className="editorial-italic text-primary">dado, não com achismo.</span>
          </p>
        </div>
        {brandsCount && (
          <p className="mono-tag text-muted-foreground hidden md:block">
            +{brandsCount} {labels['marcasatendidas']}
          </p>
        )}
      </div>
      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex gap-20 ticker whitespace-nowrap" style={{ animationPlayState: isPaused ? 'paused' : 'running' }}>
          {items.map((company, i) => {
            if (company.website_url) {
              return (
                <a
                  key={i}
                  href={company.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className="editorial text-4xl md:text-6xl text-muted-foreground/50 hover:text-primary transition-colors"
                  aria-label={`Abrir site de ${company.name}`}
                >
                  {company.name}
                </a>
              );
            }

            return (
              <span
                key={i}
                className="editorial text-4xl md:text-6xl text-muted-foreground/50 hover:text-primary transition-colors"
              >
                {company.name}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
};
