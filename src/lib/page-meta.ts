import { createContext } from "react";

/** <head> data of the page being rendered: filled by <PageHead>, read by entry-server. */
export type PageMeta = {
  title?: string;
  description?: string;
  /** Link preview image (WhatsApp, LinkedIn...): /media/... or an absolute URL. */
  image?: string | null;
  type?: "website" | "article";
  /** Public address of the site (https://host), set by entry-server before rendering. */
  siteUrl?: string;
  /** schema.org nodes for the page's JSON-LD (see lib/structured-data). */
  jsonLd?: Record<string, unknown>[];
};

/** Present only on the server (entry-server); in the browser <PageHead> updates document.head instead. */
export const PageMetaContext = createContext<PageMeta | null>(null);
