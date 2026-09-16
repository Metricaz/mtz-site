import logoMetricaz from "../../assets/logo-metricaz.webp";

interface FooterProps {
  useHomeSectionLinks?: boolean;
}

const navLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#metodo", label: "Método" },
  { href: "#cases", label: "Cases" },
  { href: "#conteudo", label: "Conteúdo" },
  { href: "#contato", label: "Contato" },
];

export const Footer = ({ useHomeSectionLinks = false }: FooterProps) => {
  const homeBase = import.meta.env.BASE_URL;
  const resolveHref = (hash: string) => (useHomeSectionLinks ? `${homeBase}${hash}` : hash);

  return (
    <footer className="relative bg-ink-deep border-t border-border pt-20 pb-10">
      <div className="container-x">
        <div className="grid md:grid-cols-12 gap-12 pb-16 border-b border-border">
          <div className="md:col-span-5">
            <a href={resolveHref("#top")} className="flex items-center gap-2.5">
              <img src={logoMetricaz} alt="Metricaz" width={394} height={103} className="h-8 w-auto" />
            </a>
            <p className="editorial text-3xl md:text-5xl mt-10 max-w-md leading-tight">
              Transformamos dados em{" "}
              <span className="editorial-italic text-primary">conhecimento</span>, ações e resultados.
            </p>
          </div>

          <div className="md:col-span-3">
            <div className="eyebrow mb-6">{"// Navegação"}</div>
            <ul className="space-y-3.5 text-muted-foreground">
              {navLinks.map((link) => (
                <li key={link.href}><a href={resolveHref(link.href)} className="hover:text-primary transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <div className="eyebrow mb-6">{"// Newsletter"}</div>
            <p className="text-muted-foreground mb-5 text-sm leading-relaxed">
              Boas práticas em SEO, CRO e Analytics direto no seu e-mail. Sem spam.
            </p>
            <form className="flex border border-border rounded-full overflow-hidden p-1 bg-ink">
              <input
                type="email"
                placeholder="seu@email.com"
                className="flex-1 bg-transparent outline-none px-4 text-sm text-foreground"
                required
              />
              <button className="px-5 h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors">
                Assinar
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mono-tag text-muted-foreground">
          <span>© 2026 Metricaz · Todos os direitos reservados</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-primary transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-primary transition-colors">Instagram</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
