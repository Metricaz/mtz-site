import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { getServiceIcon } from '@/lib/service-icons';
import { useServices } from '@/hooks/useServices';

export const Services = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const { services, loading } = useServices({ limit: 4 });
  const items = services;

  if (!loading && items.length === 0) {
    return null;
  }

  return (
    <section id="servicos" className="relative bg-background py-24 md:py-36">
      <div className="container-x">
        {/* Header */}
        <div className="mb-24 grid items-end gap-8 md:mb-32 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-8">
            <div className="eyebrow mb-6 text-xs tracking-widest">{"// SERVIÇOS"}</div>
            <h2 className="editorial text-4xl md:text-6xl leading-tight">
              Quatro pilares.<br />
              <span className="editorial-italic text-primary">Um único objetivo:</span>{" "}
              resultado.
            </h2>
          </div>
          <p className="md:col-span-4 text-muted-foreground text-sm md:text-base leading-relaxed">
            Atuamos de ponta a ponta no funil digital com método, rigor analítico e governança.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-0 border-y border-border md:grid-cols-4">
          {loading && services.length === 0
            ? Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-[360px] animate-pulse border-b border-border/80 bg-card/30 md:h-auto md:border-b-0 md:border-r" />
              ))
            : items.map((service, i) => {
                const Icon = getServiceIcon(service.icon_name);

                return (
                  <Link
                    key={service.id}
                    to={`/servicos/${service.slug}`}
                    onMouseEnter={() => setHoveredId(service.id)}
                    onMouseLeave={() => setHoveredId(null)}
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

                    <motion.div
                      initial={false}
                      animate={{
                        width: hoveredId === service.id ? 145 : 40,
                      }}
                      transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground"
                    >
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: hoveredId === service.id ? 1 : 0 }}
                        transition={{ duration: 0.15, delay: hoveredId === service.id ? 0.1 : 0 }}
                        className="whitespace-nowrap text-sm font-semibold"
                      >
                        Saiba Mais
                      </motion.span>
                      <ArrowRight className="h-5 w-5 flex-shrink-0" strokeWidth={2} />
                    </motion.div>
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




