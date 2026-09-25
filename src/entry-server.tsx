import { dehydrate } from "@tanstack/react-query";
import { PipeableStream, renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App.tsx";
import { apiQueryKey } from "@/hooks/useApiList";
import { setApiOrigin } from "@/lib/api";
import { SiteOption } from "@/lib/api-types";
import { createQueryClient } from "@/lib/query-client";
import { ROUTER_FUTURE } from "@/lib/router";

export type RenderResult = {
  /** Writes the page's HTML (everything already loaded) into a Node stream. */
  pipe: PipeableStream["pipe"];
  /** <title> and description tags, from "Opções do site" (seo.title / seo.description). */
  head: string;
  /** react-query cache, for the browser to hydrate with. */
  state: unknown;
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const renderHead = (options: SiteOption[]) => {
  const value = (key: string) => escapeHtml(options.find((o) => o.key === key)?.value ?? "");
  const title = value("seo.title");
  const description = value("seo.description");
  return [
    title && `<title>${title}</title>`,
    title && `<meta property="og:title" content="${title}" />`,
    title && `<meta name="twitter:title" content="${title}" />`,
    description && `<meta name="description" content="${description}" />`,
    description && `<meta property="og:description" content="${description}" />`,
    description && `<meta name="twitter:description" content="${description}" />`,
  ]
    .filter(Boolean)
    .join("\n    ");
};

const RENDER_TIMEOUT_MS = 10_000;

/** Renders `url` once every section has its data (Django at `apiOrigin`). */
export const render = (url: string, apiOrigin: string) =>
  new Promise<RenderResult>((resolve, reject) => {
    setApiOrigin(apiOrigin);
    const queryClient = createQueryClient();
    const app = (
      <App
        queryClient={queryClient}
        router={(children) => (
          <StaticRouter location={url} basename={import.meta.env.BASE_URL} future={ROUTER_FUTURE}>
            {children}
          </StaticRouter>
        )}
      />
    );

    // Django too slow or down: give up waiting, the sections still loading are rendered in the browser.
    const timeout = setTimeout(() => stream.abort(), RENDER_TIMEOUT_MS);
    const stream = renderToPipeableStream(app, {
      onAllReady() {
        clearTimeout(timeout);
        const options = queryClient.getQueryData<SiteOption[] | null>(apiQueryKey("/options/")) ?? [];
        resolve({ pipe: stream.pipe, head: renderHead(options), state: dehydrate(queryClient) });
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
