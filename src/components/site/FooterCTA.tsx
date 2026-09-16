import mSymbol from "@/assets/m-metricaz.png";

export const FooterCTA = () => {
  return (
    <section className="relative bg-ink-deep overflow-hidden">
      {/* faixa colorida no topo */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary-glow to-ink" />

      {/* símbolo M sutil */}
      <img
        src={mSymbol}
        alt=""
        aria-hidden
        width={1834}
        height={1920}
        className="pointer-events-none select-none absolute -right-20 top-1/2 -translate-y-1/2 h-[120%] w-auto opacity-[0.04] object-contain object-right"
      />

      <div className="container-x relative py-24 md:py-36">
        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <div className="eyebrow">{"// Próximo passo"}</div>
            <h2 className="editorial mt-6 text-5xl md:text-8xl leading-[0.95]">
              Vamos construir{" "}
              <span className="editorial-italic">o que vem</span>{" "}
              a seguir?
            </h2>
          </div>
          <div className="md:col-span-4">
            <p className="text-muted-foreground text-lg leading-relaxed mb-6">
              Conte sobre o desafio em uma frase. Retornamos em até 1 dia útil.
            </p>
            <form className="flex border border-border rounded-full overflow-hidden p-1 bg-ink">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 bg-transparent outline-none px-4 text-sm text-foreground"
                required
              />
              <a
                href="#contato"
                className="px-5 h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors inline-flex items-center"
              >
                Começar →
              </a>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
