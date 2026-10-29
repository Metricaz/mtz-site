import { useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import logoMetricaz from "@/assets/logo-metricaz.webp";
import { useApiList } from "@/hooks/useApiList";
import { useCompanyAddress } from "@/hooks/useCompanyAddress";
import { useServices } from "@/hooks/useServices";
import { useSiteImage } from "@/hooks/useSiteImage";
import { useSiteOptions } from "@/hooks/useSiteOptions";
import { SocialLink } from "@/lib/api-types";
import { PageMeta, PageMetaContext } from "@/lib/page-meta";
import {
  breadcrumbSchema,
  Crumb,
  organizationSchema,
  SchemaContext,
  SchemaNode,
  websiteSchema,
} from "@/lib/structured-data";

type PageHeadProps = {
  /** Complete title, used as is (e.g. a "título para o Google" filled in the admin). */
  title?: string;
  /** Page name, used when `title` is empty: "<name> | <seo.site_name>". */
  name?: string;
  description?: string;
  /** Link preview image; without one, "Imagens do site" → seo.og_image. */
  image?: string | null;
  type?: PageMeta["type"];
  /** Breadcrumb trail before this page (e.g. Serviços); the home page has none. */
  breadcrumb?: Crumb[];
  /** This page's own schema.org nodes (Service, BlogPosting...), see lib/structured-data. */
  schema?: (context: SchemaContext) => SchemaNode | SchemaNode[];
};

/** Sets a <meta>/<link> tag in document.head, creating it if needed; removes it when there is no value. */
const setHeadTag = (tag: "meta" | "link", match: Record<string, string>, attr: string, value: string) => {
  const selector = `${tag}${Object.entries(match).map(([k, v]) => `[${k}="${v}"]`).join("")}`;
  let element = document.head.querySelector(selector);
  if (!value) {
    element?.remove();
    return;
  }
  if (!element) {
    element = document.createElement(tag);
    Object.entries(match).forEach(([k, v]) => element!.setAttribute(k, v));
    document.head.appendChild(element);
  }
  element.setAttribute(attr, value);
};

/**
 * Title, description and link preview of the page. On the server it fills the <head> (entry-server);
 * in the browser it updates it on every navigation (tab title, and the page title GA4 records).
 */
export const PageHead = ({ title, name, description = "", image, type = "website", breadcrumb, schema }: PageHeadProps) => {
  const meta = useContext(PageMetaContext);
  const { pathname } = useLocation();
  const { options } = useSiteOptions();
  const defaultImage = useSiteImage("seo.og_image");
  // Same lists the footer and the home page load: no extra request in the browser.
  const { address } = useCompanyAddress();
  const socialLinks = useApiList<SocialLink>("/social-links/");
  const { services } = useServices();
  const siteName = options["seo.site_name"] ?? "";

  const fullTitle = title || (name && siteName ? `${name} | ${siteName}` : name || siteName);
  const imageUrl = image || defaultImage?.image || "";

  if (meta) {
    Object.assign(meta, { title: fullTitle, description, image: imageUrl, type });
    // Structured data only goes in the HTML from the server: search engines and AI crawlers read it there.
    const siteUrl = meta.siteUrl ?? "";
    const context: SchemaContext = {
      siteUrl,
      pageUrl: siteUrl + pathname,
      absolute: (path) => new URL(path, `${siteUrl}/`).href,
    };
    meta.jsonLd = [
      organizationSchema(context, { options, logo: logoMetricaz, address, socialLinks, services }),
      websiteSchema(siteUrl, siteName),
      ...(breadcrumb && name ? [breadcrumbSchema(context, breadcrumb, name)] : []),
      ...(schema ? [schema(context)].flat() : []),
    ];
  }

  useEffect(() => {
    document.title = fullTitle;
    const absoluteImage = imageUrl && new URL(imageUrl, window.location.origin).href;
    const url = window.location.origin + window.location.pathname;
    setHeadTag("meta", { name: "description" }, "content", description);
    setHeadTag("meta", { property: "og:title" }, "content", fullTitle);
    setHeadTag("meta", { property: "og:description" }, "content", description);
    setHeadTag("meta", { property: "og:type" }, "content", type);
    setHeadTag("meta", { property: "og:url" }, "content", url);
    setHeadTag("meta", { property: "og:image" }, "content", absoluteImage);
    setHeadTag("meta", { name: "twitter:title" }, "content", fullTitle);
    setHeadTag("meta", { name: "twitter:description" }, "content", description);
    setHeadTag("meta", { name: "twitter:image" }, "content", absoluteImage);
    setHeadTag("link", { rel: "canonical" }, "href", url);
  }, [fullTitle, description, imageUrl, type]);

  return null;
};

/** <PageHead> of a fixed page, from "Opções do site": seo.<page>.title and seo.<page>.description. */
export const OptionPageHead = ({ page, crumb, schema }: { page: string; crumb?: string; schema?: PageHeadProps["schema"] }) => {
  const { options } = useSiteOptions();
  return (
    <PageHead
      title={options[`seo.${page}.title`]}
      name={crumb}
      description={options[`seo.${page}.description`]}
      breadcrumb={crumb ? [] : undefined}
      schema={schema}
    />
  );
};
