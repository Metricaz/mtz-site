import { useCompanies } from '@/hooks/useCompanies';
import { useState } from 'react';

// Fallback para quando não há empresas cadastradas
const fallbackBrands = ["Whirlpool", "Claro", "Veloe", "Lavazza", "Ambev", "Bradesco", "Natura", "Itaú"];

export const Logos = () => {
  const { companies } = useCompanies();
  const [isPaused, setIsPaused] = useState(false);

  // Usar empresas do Supabase, ou fallback para marcas estáticas
  const displayBrands = companies.length > 0 
    ? companies.map(c => c.name)
    : fallbackBrands;

  // Duplicar items para efeito de loop infinito
  const items = [...displayBrands, ...displayBrands];

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
        <p className="mono-tag text-muted-foreground hidden md:block">+{companies.length > 0 ? companies.length * 10 : 80} marcas atendidas</p>
      </div>
      <div
        className="overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex gap-20 ticker whitespace-nowrap" style={{ animationPlayState: isPaused ? 'paused' : 'running' }}>
          {items.map((item, i) => {
            const company = companies[i % companies.length];
            const isCompany = companies.length > 0;

            if (isCompany && company?.website_url) {
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
                {item}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
};
