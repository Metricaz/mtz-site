import { hydrate } from "@tanstack/react-query";
import { hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.tsx";
import { createQueryClient } from "@/lib/query-client";
import { ROUTER_FUTURE } from "@/lib/router";
import "./index.css";

declare global {
  interface Window {
    /** Data the server rendered the page with (see server.js), so nothing is fetched twice. */
    __REACT_QUERY_STATE__?: unknown;
  }
}

const queryClient = createQueryClient();
hydrate(queryClient, window.__REACT_QUERY_STATE__);

hydrateRoot(
  document.getElementById("root")!,
  <App
    queryClient={queryClient}
    router={(children) => (
      <BrowserRouter basename={import.meta.env.BASE_URL} future={ROUTER_FUTURE}>
        {children}
      </BrowserRouter>
    )}
  />,
);
