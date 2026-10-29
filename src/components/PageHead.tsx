import { useContext, useEffect } from "react";
import { useSiteImage } from "@/hooks/useSiteImage";
import { useSiteOptions } from "@/hooks/useSiteOptions";
import { PageMeta, PageMetaContext } from "@/lib/page-meta";

type PageHeadProps = {
  /** Complete title, used as is (e.g. a "título para o Google" filled in the admin). */
  title?: string;
  /** Page name, used when `title` is empty: "<name> | <seo.site_name>". */
  name?: string;
  description?: string;
  /** Link preview image; without one, "Imagens do site" → seo.og_image. */
  image?: string | null;
  type?: PageMeta["type"];
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
export const PageHead = ({ title, name, description = "", image, type = "website" }: PageHeadProps) => {
  const meta = useContext(PageMetaContext);
  const { options } = useSiteOptions();
  const defaultImage = useSiteImage("seo.og_image");
  const siteName = options["seo.site_name"] ?? "";

  const fullTitle = title || (name && siteName ? `${name} | ${siteName}` : name || siteName);
  const imageUrl = image || defaultImage?.image || "";

  if (meta) Object.assign(meta, { title: fullTitle, description, image: imageUrl, type });

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
export const OptionPageHead = ({ page }: { page: string }) => {
  const { options } = useSiteOptions();
  return <PageHead title={options[`seo.${page}.title`]} description={options[`seo.${page}.description`]} />;
};
