import { Users, Briefcase, TrendingUp } from "lucide-react";

const models = [
  {
    icon: Users,
    n: "01",
    t: "Alocação de Equipe",
    d: "Squads dedicados que se integram ao seu time, com cadência semanal e governança clara.",
  },
  {
    icon: Briefcase,
    n: "02",
    t: "Projetos Especiais",
    d: "Entregas com escopo fechado: migrações, implementações, auditorias e tracking.",
  },
  {
    icon: TrendingUp,
    n: "03",
    t: "Success Fee",
    d: "Modelo híbrido em que parte da remuneração é atrelada à performance e a metas.",
  },
];

export const Models = () => {
  return (
    <section className="py-24 md:py-36 bg-ink-deep border-y border-border">
      <div className="container-x">
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="eyebrow">{"// Modelos de contratação"}</div>
          <h2 className="editorial mt-5 text-5xl md:text-7xl">
            Como{" "}
            <span className="editorial-italic text-primary">trabalhamos</span> juntos.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border border border-border rounded-3xl overflow-hidden">
          {models.map(({ icon: Icon, n, t, d }) => (
            <div
              key={n}
              className="relative group p-8 md:p-10 bg-ink min-h-[340px] flex flex-col justify-between hover:bg-ink-soft transition-colors"
            >
              <div className="flex items-start justify-between">
                <span className="editorial text-4xl text-primary">{n}</span>
                <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="editorial text-3xl md:text-4xl mb-4">{t}</h3>
                <p className="text-muted-foreground leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
