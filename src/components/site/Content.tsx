import { ArrowRight } from "lucide-react";

const posts = [
  {
    tag: "Privacidade",
    date: "12 mai 2026",
    read: "8 min",
    t: "Google Consent Mode v2: o que muda e por que sua empresa precisa disso agora",
    thumb: "from-primary via-primary-glow to-ink-soft",
    initial: "C",
  },
  {
    tag: "Tag Manager",
    date: "04 mai 2026",
    read: "6 min",
    t: "Por que você precisa do Google Tag Manager (e como começar do jeito certo)",
    thumb: "from-ink-soft via-ink to-primary/60",
    initial: "G",
  },
  {
    tag: "Analytics",
    date: "28 abr 2026",
    read: "10 min",
    t: "Dimensões personalizadas no Google Analytics: o guia que faltava",
    thumb: "from-cream via-primary/40 to-ink-deep",
    initial: "A",
  },
  {
    tag: "SEO",
    date: "15 abr 2026",
    read: "7 min",
    t: "Core Web Vitals 2024: Como otimizar a experiência do usuário",
    thumb: "from-primary/40 via-ink-soft to-primary",
    initial: "S",
  },
  {
    tag: "CRO",
    date: "08 abr 2026",
    read: "9 min",
    t: "Testes A/B que funcionam: metodologia completa para conversões",
    thumb: "from-ink via-primary-glow to-cream",
    initial: "T",
  },
];

export const Content = () => {
  return (
    <section id="conteudo" className="py-24 md:py-36 bg-background">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20">
          <div>
            <div className="eyebrow mb-4 text-xs tracking-widest">{"// INSIGHTS & IDEIAS"}</div>
            <h2 className="editorial text-4xl md:text-6xl leading-tight">
              Onde estratégia encontra<br />
              <span className="editorial-italic text-primary">imaginação</span>.
            </h2>
          </div>
        </div>

        {/* Grid de Posts - Assimétrico */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 auto-rows-max">
          {/* Primeiro post - ocupa 2 linhas */}
          {posts.length > 0 && (
            <a
              href="#"
              className="group flex flex-col rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5 md:row-span-2"
            >
              {/* Thumbnail maior */}
              <div className={`relative aspect-[16/12] bg-gradient-to-br ${posts[0].thumb} overflow-hidden`}>
                <div className="absolute inset-0 grid-bg opacity-30" />
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium text-foreground">
                    <span className="text-primary">✱</span>
                    {posts[0].tag}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 md:p-8 flex flex-col gap-4 flex-1">
                <div className="text-xs text-muted-foreground">
                  📅 {posts[0].date}
                </div>
                <h3 className="text-lg md:text-2xl font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                  {posts[0].t}
                </h3>
                
                <p className="text-sm text-muted-foreground flex-grow">
                  By grounding in customer good and insights, so product main for businesses to anticipate trends and adapt quickly to evolving demands. This forward-looking approach ensures...
                </p>

                {/* CTA */}
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110 group-hover:translate-x-0.5">
                  <ArrowRight className="w-5 h-5" strokeWidth={2} />
                </div>
              </div>
            </a>
          )}

        {/* Segundo, terceiro, quarto e quinto posts - coluna direita */}
          <div className="flex flex-col gap-8">
            {posts.slice(1).map((p, i) => (
              <a
                key={i + 1}
                href="#"
                className="group flex flex-col md:flex-row gap-4 rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5"
              >
                {/* Thumbnail pequena */}
                <div className={`relative aspect-[16/10] md:aspect-square md:w-40 md:flex-shrink-0 bg-gradient-to-br ${p.thumb} overflow-hidden rounded-xl`}>
                  <div className="absolute inset-0 grid-bg opacity-30" />
                </div>

                {/* Body */}
                <div className="p-4 md:p-6 flex flex-col gap-3 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-foreground">
                      <span className="text-primary">✱</span>
                      {p.tag}
                    </span>
                    <span className="text-xs text-muted-foreground">📅 {p.date}</span>
                  </div>
                  
                  <h3 className="text-base md:text-lg font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                    {p.t}
                  </h3>

                  {/* CTA */}
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110 group-hover:translate-x-0.5">
                    <ArrowRight className="w-4 h-4" strokeWidth={2} />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* View All Button */}
        <div className="flex justify-center">
          <a href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 border-primary text-primary font-medium hover:bg-primary hover:text-primary-foreground transition-all">
            Ver todos os posts
            <ArrowRight className="w-4 h-4" strokeWidth={2} />
          </a>
        </div>
      </div>
    </section>
  );
};

