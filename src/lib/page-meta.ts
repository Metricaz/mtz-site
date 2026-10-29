import { createContext } from "react";

/** <head> data of the page being rendered: filled by <PageHead>, read by entry-server. */
export type PageMeta = {
  title?: string;
  description?: string;
  /** Link preview image (WhatsApp, LinkedIn...): /media/... or an absolute URL. */
  image?: string | null;
  type?: "website" | "article";
};

/** Present only on the server (entry-server); in the browser <PageHead> updates document.head instead. */
export const PageMetaContext = createContext<PageMeta | null>(null);
