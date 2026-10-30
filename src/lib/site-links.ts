/** Main navigation of the site (menu and footer). */
export type SiteLink = { href: string; label: string; isPage?: boolean };

// Real pages wherever there is one; "Método" only exists as a home section.
export const siteLinks: SiteLink[] = [
  { href: "/quem-somos", label: "Quem Somos", isPage: true },
  { href: "/servicos", label: "Serviços", isPage: true },
  { href: "#metodo", label: "Método" },
  { href: "/cases", label: "Cases", isPage: true },
  { href: "/blog", label: "Blog", isPage: true },
  { href: "/contato", label: "Contato", isPage: true },
];

// Footer only: applying to work here is mostly by an invite from HR; this is the way in for the curious.
export const footerLinks: SiteLink[] = [
  ...siteLinks,
  { href: "https://candidatos.metricaz.com", label: "Trabalhe conosco" },
];
