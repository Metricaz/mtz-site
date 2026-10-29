import { dehydrate } from "@tanstack/react-query";
import { PipeableStream, renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App.tsx";
import { apiQueryKey } from "@/hooks/useApiList";
import { setApiOrigin } from "@/lib/api";
import { SiteOption } from "@/lib/api-types";
import { HttpStatus, HttpStatusContext } from "@/lib/http-status";
import { PageMeta, PageMetaContext } from "@/lib/page-meta";
import { createQueryClient } from "@/lib/query-client";
import { ROUTER_FUTURE } from "@/lib/router";

export type RenderResult = {
  /** Writes the page's HTML (everything already loaded) into a Node stream. */
  pipe: PipeableStream["pipe"];
  /** <title>, description, canonical and link preview tags, from the page's <PageHead>. */
  head: string;
  /** react-query cache, for the browser to hydrate with. */
  state: unknown;
  /** HTTP status: 404 when the page rendered a "not found" screen. */
  status: number;
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/**
 * <head> tags of the page, from its <PageHead> (falls back to the site name from "Opções do site").
 * Canonical and og:url point to the page itself at `siteUrl`; "not found" pages get neither.
 */
const renderHead = (meta: PageMeta, options: SiteOption[], siteUrl: string, url: string, status: number) => {
  const option = (key: string) => options.find((o) => o.key === key)?.value ?? "";
  const siteName = escapeHtml(option("seo.site_name"));
  const title = escapeHtml(meta.title || option("seo.site_name"));
  const description = escapeHtml(meta.description ?? "");
  const pageUrl = status === 200 ? escapeHtml(siteUrl + new URL(url, siteUrl).pathname) : "";
  const image = meta.image ? escapeHtml(new URL(meta.image, siteUrl).href) : "";
  return [
    title && `<title>${title}</title>`,
    title && `<meta property="og:title" content="${title}" />`,
    title && `<meta name="twitter:title" content="${title}" />`,
    description && `<meta name="description" content="${description}" />`,
    description && `<meta property="og:description" content="${description}" />`,
    description && `<meta name="twitter:description" content="${description}" />`,
    pageUrl && `<link rel="canonical" href="${pageUrl}" />`,
    pageUrl && `<meta property="og:url" content="${pageUrl}" />`,
    `<meta property="og:type" content="${meta.type ?? "website"}" />`,
    siteName && `<meta property="og:site_name" content="${siteName}" />`,
    image && `<meta property="og:image" content="${image}" />`,
    image && `<meta name="twitter:image" content="${image}" />`,
  ]
    .filter(Boolean)
    .join("\n    ");
};

const RENDER_TIMEOUT_MS = 10_000;

/** Renders `url` once every section has its data (Django at `apiOrigin`); `siteUrl` is the public address. */
export const render = (url: string, apiOrigin: string, siteUrl: string) =>
  new Promise<RenderResult>((resolve, reject) => {
    setApiOrigin(apiOrigin);
    const queryClient = createQueryClient();
    const status: HttpStatus = { code: 200 };
    const meta: PageMeta = {};
    const app = (
      <HttpStatusContext.Provider value={status}>
        <PageMetaContext.Provider value={meta}>
        <App
          queryClient={queryClient}
          router={(children) => (
            <StaticRouter location={url} basename={import.meta.env.BASE_URL} future={ROUTER_FUTURE}>
              {children}
            </StaticRouter>
          )}
        />
        </PageMetaContext.Provider>
      </HttpStatusContext.Provider>
    );

    // Django too slow or down: give up waiting, the sections still loading are rendered in the browser.
    const timeout = setTimeout(() => stream.abort(), RENDER_TIMEOUT_MS);
    const stream = renderToPipeableStream(app, {
      onAllReady() {
        clearTimeout(timeout);
        const options = queryClient.getQueryData<SiteOption[] | null>(apiQueryKey("/options/")) ?? [];
        resolve({
          pipe: stream.pipe,
          head: renderHead(meta, options, siteUrl, url, status.code),
          state: dehydrate(queryClient),
          status: status.code,
        });
      },
      onShellError(error) {
        clearTimeout(timeout);
        reject(error);
      },
      onError(error) {
        console.error(error);
      },
    });
  });
