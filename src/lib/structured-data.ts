import { Author, CompanyAddress, SocialLink } from "@/lib/api-types";

/**
 * Structured data (schema.org JSON-LD): tells search engines and AI assistants who Metricaz is and
 * what each page is. Built from the same database content the page shows; empty values are left out.
 */
export type SchemaNode = Record<string, unknown>;

/** What a page's own schema needs: the public address of the site and of the page. */
export type SchemaContext = { siteUrl: string; pageUrl: string; absolute: (path: string) => string };

/** One step of the breadcrumb trail, before the current page (which is added automatically). */
export type Crumb = { label: string; href: string };

export const organizationId = (siteUrl: string) => `${siteUrl}/#organization`;
export const websiteId = (siteUrl: string) => `${siteUrl}/#website`;

/** Drops empty strings, nulls and empty lists, so a field missing in the admin is simply not sent. */
const compact = (node: SchemaNode): SchemaNode =>
  Object.fromEntries(
    Object.entries(node).filter(([, value]) => value != null && value !== "" && !(Array.isArray(value) && !value.length)),
  );

type OrganizationData = {
  options: Record<string, string>;
  logo: string;
  address: CompanyAddress | null;
  socialLinks: SocialLink[];
  services: { title: string }[];
};

const postalAddress = (address: CompanyAddress): SchemaNode =>
  compact({
    "@type": "PostalAddress",
    streetAddress: [address.street, address.complement].filter(Boolean).join(" - "),
    addressLocality: address.city,
    addressRegion: address.state,
    postalCode: address.postal_code,
    addressCountry: address.country,
  });

export const organizationSchema = (
  { siteUrl, absolute }: SchemaContext,
  { options, logo, address, socialLinks, services }: OrganizationData,
): SchemaNode =>
  compact({
    "@type": "Organization",
    "@id": organizationId(siteUrl),
    name: options["seo.site_name"],
    url: `${siteUrl}/`,
    logo: absolute(logo),
    description: options["seo.home.description"],
    foundingDate: options["company.founding_year"],
    email: options["contact.email"],
    knowsAbout: services.map((service) => service.title),
    address: address && postalAddress(address),
    telephone: address?.phone,
    // Footer links that leave the site (LinkedIn, Instagram...); /politica-de-privacidade etc. are not profiles.
    sameAs: socialLinks.map((link) => link.url).filter((url) => /^https?:\/\//.test(url)),
  });

export const websiteSchema = (siteUrl: string, name: string): SchemaNode =>
  compact({
    "@type": "WebSite",
    "@id": websiteId(siteUrl),
    url: `${siteUrl}/`,
    name,
    inLanguage: "pt-BR",
    publisher: { "@id": organizationId(siteUrl) },
  });

export const breadcrumbSchema = ({ pageUrl, absolute }: SchemaContext, crumbs: Crumb[], current: string): SchemaNode => ({
  "@type": "BreadcrumbList",
  itemListElement: [{ label: "Início", href: "/" }, ...crumbs, { label: current, href: pageUrl }].map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.label,
    item: absolute(crumb.href),
  })),
});

/** Contact page: the page itself plus one office (ProfessionalService) per address in the admin. */
export const contactSchema = (
  { siteUrl, pageUrl }: SchemaContext,
  { name, email, addresses }: { name: string; email: string; addresses: CompanyAddress[] },
): SchemaNode[] => [
  { "@type": "ContactPage", url: pageUrl, about: { "@id": organizationId(siteUrl) } },
  ...addresses.map((address) =>
    compact({
      "@type": "ProfessionalService",
      "@id": `${siteUrl}/#office-${address.id}`,
      name: [name, address.label].filter(Boolean).join(" · "),
      url: `${siteUrl}/`,
      email,
      telephone: address.phone,
      address: postalAddress(address),
      parentOrganization: { "@id": organizationId(siteUrl) },
    }),
  ),
];

export const serviceSchema = ({ siteUrl, pageUrl }: SchemaContext, name: string, description: string): SchemaNode =>
  compact({
    "@type": "Service",
    name,
    serviceType: name,
    description,
    url: pageUrl,
    provider: { "@id": organizationId(siteUrl) },
    areaServed: "BR",
  });

type ArticleData = {
  type: "BlogPosting" | "Article";
  headline: string;
  description: string;
  image: string;
  datePublished?: string;
  dateModified?: string;
  /** Post author; without one (cases) the article is by Metricaz. */
  author?: Author | null;
};

/** Blog author, with the author page and LinkedIn so search engines and AIs can tell who wrote it. */
export const personSchema = ({ siteUrl, absolute }: SchemaContext, author: Author): SchemaNode =>
  compact({
    "@type": "Person",
    "@id": author.slug ? `${siteUrl}/autor/${author.slug}#person` : undefined,
    name: author.name,
    jobTitle: author.role,
    description: author.mini_bio,
    image: author.photo ? absolute(author.photo) : undefined,
    url: author.slug ? absolute(`/autor/${author.slug}`) : undefined,
    sameAs: author.linkedin_url ? [author.linkedin_url] : undefined,
    worksFor: { "@id": organizationId(siteUrl) },
  });

export const articleSchema = (context: SchemaContext, article: ArticleData): SchemaNode => {
  const { siteUrl, pageUrl, absolute } = context;
  return compact({
    "@type": article.type,
    headline: article.headline,
    description: article.description,
    image: article.image && absolute(article.image),
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    inLanguage: "pt-BR",
    mainEntityOfPage: pageUrl,
    author: article.author ? personSchema(context, article.author) : { "@id": organizationId(siteUrl) },
    publisher: { "@id": organizationId(siteUrl) },
  });
};

/** FAQ shown on the page (FAQPage only describes questions that are visible there). */
export const faqSchema = (items: { question: string; answer: string }[]): SchemaNode[] =>
  items.length
    ? [
        {
          "@type": "FAQPage",
          mainEntity: items.map((item) => ({
            "@type": "Question",
            name: item.question,
            acceptedAnswer: { "@type": "Answer", text: item.answer },
          })),
        },
      ]
    : [];

/**
 * Listing pages (/servicos, /cases, /blog): the page plus the ordered list of what it links to,
 * so search engines and AI assistants see the whole collection. The blog is typed as a Blog.
 */
export const collectionSchema = (
  { siteUrl, pageUrl, absolute }: SchemaContext,
  { type = "CollectionPage", name, items }: { type?: "CollectionPage" | "Blog"; name: string; items: { name: string; path: string }[] },
): SchemaNode =>
  compact({
    "@type": type,
    name,
    url: pageUrl,
    inLanguage: "pt-BR",
    isPartOf: { "@id": websiteId(siteUrl) },
    publisher: type === "Blog" ? { "@id": organizationId(siteUrl) } : undefined,
    mainEntity: items.length
      ? {
          "@type": "ItemList",
          numberOfItems: items.length,
          itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            url: absolute(item.path),
          })),
        }
      : undefined,
  });

/** Quem Somos: the page is about the organization described in the Organization node. */
export const aboutSchema = ({ siteUrl, pageUrl }: SchemaContext, name: string): SchemaNode => ({
  "@type": "AboutPage",
  name,
  url: pageUrl,
  inLanguage: "pt-BR",
  about: { "@id": organizationId(siteUrl) },
  isPartOf: { "@id": websiteId(siteUrl) },
});
