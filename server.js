/**
 * Serves the site with server-side rendering: every page leaves here already filled with the
 * content from Django, and React takes over in the browser (hydration).
 *
 *   npm run dev    development, with Vite (hot reload)
 *   npm start      production, from the build (npm run build)
 *
 * Environment: PORT (default 8080), DJANGO_URL (default http://127.0.0.1:8000).
 */
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { Writable } from "node:stream";
import { fileURLToPath } from "node:url";
import compression from "compression";
import express from "express";

const root = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 8080);
const djangoUrl = process.env.DJANGO_URL || "http://127.0.0.1:8000";

// Paths answered by Django. In production nginx sends them straight to gunicorn; the proxy below
// is for running everything from one address locally (the Django session cookie needs it).
const DJANGO_PATHS = ["/api", "/admin", "/static", "/media", "/dashboard/login", "/dashboard/logout"];

const proxyToDjango = (req, res) => {
  const upstream = http.request(
    new URL(req.originalUrl, djangoUrl),
    { method: req.method, headers: req.headers },
    (response) => {
      res.writeHead(response.statusCode, response.headers);
      response.pipe(res);
    },
  );
  upstream.on("error", (error) => {
    console.error(`Django (${djangoUrl}) unreachable:`, error.message);
    if (!res.headersSent) res.status(502).end("Django indisponível");
  });
  req.pipe(upstream);
};

/** Collects what React writes into a string. */
const collect = (pipe) =>
  new Promise((resolve, reject) => {
    const chunks = [];
    const sink = new Writable({
      write(chunk, _encoding, callback) {
        chunks.push(chunk);
        callback();
      },
      final(callback) {
        resolve(Buffer.concat(chunks).toString("utf-8"));
        callback();
      },
    });
    sink.on("error", reject);
    pipe(sink);
  });

// JSON inside <script>: "<" escaped so content can never close the tag.
const serializeState = (state) => JSON.stringify(state).replace(/</g, "\\u003c");

const app = express();
app.disable("x-powered-by");

app.use((req, res, next) => {
  if (DJANGO_PATHS.some((prefix) => req.path.startsWith(prefix))) return proxyToDjango(req, res);
  next();
});

// Same redirects the React routes do in the browser, answered here as real HTTP redirects.
app.use((req, res, next) => {
  if (req.path === "/dashboard" || req.path === "/dashboard/") return res.redirect(302, "/dashboard/sectors");
  const legacy = req.originalUrl.match(/^\/metricaz(\/.*)?$/);
  if (legacy) return res.redirect(301, legacy[1] || "/");
  next();
});

// gzip (nginx does it in production too; already-compressed responses are left alone).
app.use(compression());

let vite;
let productionTemplate;
let productionRender;
if (isProduction) {
  const sirv = (await import("sirv")).default;
  const assets = sirv(path.join(root, "dist/client"), { extensions: [] });
  // index.html is only the template (below), never served as is.
  app.use((req, res, next) => (req.path === "/index.html" ? next() : assets(req, res, next)));
  productionTemplate = await fs.readFile(path.join(root, "dist/client/index.html"), "utf-8");
  productionRender = (await import("./dist/server/entry-server.js")).render;
} else {
  const { createServer } = await import("vite");
  vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
  app.use(vite.middlewares);
}

app.use(async (req, res) => {
  const url = req.originalUrl;
  try {
    let template = productionTemplate;
    let render = productionRender;
    if (vite) {
      template = await vite.transformIndexHtml(url, await fs.readFile(path.join(root, "index.html"), "utf-8"));
      render = (await vite.ssrLoadModule("/src/entry-server.tsx")).render;
    }

    const { pipe, head, state } = await render(url, djangoUrl);
    const html = await collect(pipe);
    const page = template
      .replace("<!--app-head-->", () => head)
      .replace("<!--app-html-->", () => html)
      .replace("<!--app-state-->", () => `<script>window.__REACT_QUERY_STATE__ = ${serializeState(state)}</script>`);
    res.status(200).set("Content-Type", "text/html; charset=utf-8").end(page);
  } catch (error) {
    vite?.ssrFixStacktrace(error);
    console.error(`SSR failed for ${url}:`, error);
    res.status(500).end("Erro interno");
  }
});

app.listen(port, () => {
  console.log(`Site: http://localhost:${port} (${isProduction ? "produção" : "desenvolvimento"}) · Django: ${djangoUrl}`);
});
