import { useCompanies } from '@/hooks/useCompanies';
import { useSiteOptions } from '@/hooks/useSiteOptions';
import { OptionText } from '@/components/site/OptionText';
import { useState } from 'react';

export const Logos = () => {
  const { companies } = useCompanies();
  const { options, labels } = useSiteOptions();
  const [isPaused, setIsPaused] = useState(false);

  if (companies.length === 0) {
    return null;
  }

  const brandsCount = options['marcasatendidas'];
  // "logos" shows each company's logo (name when it has none); anything else shows the names
  const showLogos = options['logos.display']?.trim().toLowerCase() === 'logos';

  // Duplicar items para efeito de loop infinito
  const items = [...companies, ...companies];
  // Same speed whatever the number of companies: seconds per company (names are wider than logos)
  const duration = `${companies.length * (showLogos ? 4 : 6.5)}s`;

  return (
    <section className="py-20 md:py-24 border-b border-border">
      <div className="container-x mb-10 flex items-end justify-between">
        <div>
          <OptionText k="logos.eyebrow" as="p" className="eyebrow" />
          <OptionText
            k="logos.title"
            as="p"
            className="editorial mt-4 text-3xl md:text-5xl max-w-xl"
            accentClassName="editorial-italic text-primary"
          />
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
        {/* w-max: the strip is as wide as its content, so -50% is exactly one copy of the list.
            Spacing is padding on each item (not gap), so both copies have the same width. */}
        <div
          className="flex w-max ticker whitespace-nowrap"
          style={{ animationDuration: duration, animationPlayState: isPaused ? 'paused' : 'running' }}
        >
          {items.map((company, i) => {
            const content = showLogos && company.logo ? (
              <img
                src={company.logo}
                alt={company.logo_alt || company.name}
                width={500}
                height={500}
                loading="lazy"
                decoding="async"
                className="h-24 md:h-32 w-auto opacity-70 hover:opacity-100 transition-opacity"
              />
            ) : (
              company.name
            );
            const className = showLogos && company.logo
              ? 'shrink-0 pr-20'
              : 'shrink-0 pr-20 editorial text-4xl md:text-6xl text-muted-foreground/50 hover:text-primary transition-colors';

            if (company.website_url) {
              return (
                <a
                  key={i}
                  href={company.website_url}
                  target="_blank"
                  rel="noreferrer"
                  className={className}
                  aria-label={`Abrir site de ${company.name}`}
                >
                  {content}
                </a>
              );
            }

            return (
              <span key={i} className={className}>
                {content}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
};
