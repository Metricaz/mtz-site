import { Link } from 'react-router-dom';
import { Nav } from '@/components/site/Nav';
import { Footer } from '@/components/site/Footer';
import { useServices } from '@/hooks/useServices';
import { OptionText } from '@/components/site/OptionText';
import { getServiceIcon } from '@/lib/service-icons';
import { ArrowRight } from 'lucide-react';

const ServicesPage = () => {
  const { services, loading } = useServices();
  const displayServices = services;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav useHomeSectionLinks />

      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <div className="mb-6">
            <OptionText k="servicespage.eyebrow" className="mono-tag rounded-full bg-primary/15 px-3 py-1.5 text-primary" />
          </div>
          <OptionText
            k="servicespage.title"
            as="h1"
            className="editorial text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]"
            accentClassName="editorial-italic text-primary"
          />
          <OptionText k="servicespage.description" as="p" className="mt-6 max-w-3xl text-base text-foreground/85 md:text-lg" />
        </div>
      </section>

      {(loading || displayServices.length > 0) && (
      <section className="py-12 md:py-16">
        <div className="container-x">
          <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <OptionText k="servicespage.list_eyebrow" as="p" className="eyebrow" />
              <OptionText
                k="servicespage.list_title"
                as="h2"
                className="editorial mt-4 text-4xl md:text-6xl"
                accentClassName="editorial-italic text-primary"
              />
            </div>
            <OptionText k="servicespage.list_description" as="p" className="max-w-xl text-sm text-muted-foreground md:text-base" />
          </div>

          {loading && services.length === 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-[280px] animate-pulse rounded-3xl border border-border bg-card/40" />
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {displayServices.map((service) => {
                const Icon = getServiceIcon(service.icon_name);

                return (
                  <Link
                    key={service.id}
                    to={`/servicos/${service.slug}`}
                    className="group flex h-full flex-col rounded-3xl border border-border bg-card/55 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-card"
                  >
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="editorial text-3xl leading-none text-foreground">{service.title}</h3>
                    <p className="mt-4 flex-1 text-sm leading-7 text-muted-foreground">{service.excerpt}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Ver serviço
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
      )}

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default ServicesPage;