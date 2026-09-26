import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import logoMetricaz from "../../assets/logo-metricaz.webp";

const links = [
  { href: "/quem-somos", label: "Quem Somos", isPage: true },
  { href: "#servicos", label: "Serviços" },
  { href: "#metodo", label: "Método" },
  { href: "#cases", label: "Cases" },
  { href: "#conteudo", label: "Conteúdo" },
  { href: "#contato", label: "Contato" },
];

interface NavProps {
  useHomeSectionLinks?: boolean;
}

export const Nav = ({ useHomeSectionLinks = false }: NavProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // Known only in the browser (set on mount), so the server and the first client render match.
  const [isMobile, setIsMobile] = useState(false);
  const homeBase = import.meta.env.BASE_URL;
  const resolveHref = (href: string, isPage?: boolean) => {
    if (isPage) {
      return `${homeBase}${href.replace(/^\//, "")}`;
    }

    return useHomeSectionLinks ? `${homeBase}${href}` : href;
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    window.addEventListener("scroll", onScroll);
    mediaQuery.addEventListener?.("change", updateViewport);

    const preloadLink = document.createElement("link");
    preloadLink.rel = "preload";
    preloadLink.as = "image";
    preloadLink.href = logoMetricaz;
    preloadLink.fetchPriority = "high";
    document.head.appendChild(preloadLink);

    return () => {
      window.removeEventListener("scroll", onScroll);
      mediaQuery.removeEventListener?.("change", updateViewport);
      preloadLink.remove();
    };
  }, []);

  const mobileMenu = (
    <div className="fixed md:hidden bottom-6 right-6 z-40">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Fechar menu móvel"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-0 bg-black/45 backdrop-blur-[2px]"
        />
      )}

      <button
        type="button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
        aria-expanded={mobileMenuOpen}
        className="relative z-20 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-primary-foreground bg-primary text-primary-foreground shadow-[0_18px_42px_-18px_rgba(0,0,0,0.85)] focus-visible:outline-none"
        style={{ WebkitTapHighlightColor: "transparent" }}
      >
        <span className="pointer-events-none absolute -inset-3 -z-10 rounded-full bg-indigo-500/38 blur-2xl" />
        <span className="pointer-events-none absolute -inset-1 -z-10 rounded-full bg-violet-500/22 blur-lg" />
        {mobileMenuOpen ? <X className="h-6 w-6" strokeWidth={2.75} /> : <Menu className="h-6 w-6" strokeWidth={2.9} />}
      </button>

      {mobileMenuOpen && (
        <div className="absolute bottom-20 right-0 z-30 w-56 space-y-2 rounded-2xl border border-border bg-background p-4 shadow-2xl">
          {links.map((link) => (
            <a
              key={link.href}
              href={resolveHref(link.href, link.isPage)}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-sm font-medium text-foreground hover:bg-primary/10 hover:text-primary transition-all"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "backdrop-blur-xl bg-background/75 border-b border-border" : ""
        }`}
      >
        <div className="container-x flex items-center justify-between h-16 md:h-20">
          <a href={resolveHref("#top")} className="flex items-center gap-2.5">
            <img
              src={logoMetricaz}
              alt="Metricaz"
              width={394}
              height={103}
              loading="eager"
              // React 18 only passes the lowercase HTML attribute through to the <img>.
              {...{ fetchpriority: "high" }}
              decoding="async"
              className="h-8 w-auto"
            />
          </a>
          <nav className="hidden md:flex items-center gap-9 text-sm text-muted-foreground">
            {links.map((l) => (
              <a key={l.href} href={resolveHref(l.href, l.isPage)} className="hover:text-foreground transition-colors">
                {l.label}
              </a>
            ))}
          </nav>
          <a
            href={resolveHref("/contato", true)}
            className="group inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full bg-primary text-primary-foreground hover:bg-primary-glow transition-colors"
          >
            Falar com a gente
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>
      </header>

      {isMobile && mobileMenu}
    </>
  );
};

