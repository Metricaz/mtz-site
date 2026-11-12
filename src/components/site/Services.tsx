import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getServiceIcon } from '@/lib/service-icons';
import { useServices } from '@/hooks/useServices';
import { OptionText } from '@/components/site/OptionText';

export const Services = () => {
  const { services } = useServices({ limit: 4 });
  const items = services;

  if (items.length === 0) {
    return null;
  }

  return (
    <section id="servicos" className="relative bg-background py-24 md:py-36">
      <div className="container-x">
        {/* Header */}
        <div className="mb-24 grid items-end gap-8 md:mb-32 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-8">
            <OptionText k="services.eyebrow" as="div" className="eyebrow mb-6 text-xs tracking-widest" />
            <OptionText
              k="services.title"
              as="h2"
              className="editorial text-4xl md:text-6xl leading-tight"
              accentClassName="editorial-italic text-primary"
            />
          </div>
          <OptionText
            k="services.description"
            as="p"
            className="md:col-span-4 text-muted-foreground text-sm md:text-base leading-relaxed"
          />
        </div>

        {/* Cards Grid */}
        <div className="grid gap-0 border-y border-border md:grid-cols-4">
          {items.map((service, i) => {
            const Icon = getServiceIcon(service.icon_name);

            return (
              <Link
                key={service.id}
                to={`/servicos/${service.slug}`}
                className={`group relative flex flex-col items-center px-8 py-16 text-center transition-all duration-300 hover:bg-card md:px-10 md:py-20 ${
                  i !== items.length - 1 ? 'border-r border-border' : ''
                }`}
              >
                <div className="mb-12 rounded-full bg-primary/10 p-5 transition-all duration-300 group-hover:scale-110 group-hover:bg-primary/20">
                  <Icon className="h-12 w-12 text-primary md:h-16 md:w-16" strokeWidth={1.2} fill="none" />
                </div>

                <h3 className="mb-4 text-xl font-semibold text-foreground md:text-2xl">{service.title}</h3>

                <p className="mb-8 max-w-xs flex-grow text-sm leading-relaxed text-muted-foreground md:text-base">
                  {service.excerpt}
                </p>

                {/* Grows into "Saiba Mais" on hover/focus; plain CSS (no animation library on the home page). */}
                <div className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-primary text-primary-foreground transition-[width] duration-300 ease-in-out group-hover:w-[145px] group-focus-visible:w-[145px]">
                  <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold opacity-0 transition-all duration-300 group-hover:mr-2 group-hover:max-w-[100px] group-hover:opacity-100 group-focus-visible:mr-2 group-focus-visible:max-w-[100px] group-focus-visible:opacity-100">
                    Saiba Mais
                  </span>
                  <ArrowRight className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center">
          <Link to="/servicos" className="mono-tag inline-flex items-center gap-2 text-muted-foreground hover:text-primary">
            Ver mais serviços <span>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};




