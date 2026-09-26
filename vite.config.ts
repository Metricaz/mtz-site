import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

/**
 * Build only: puts the site CSS inside index.html (<style>) instead of a <link>, so the first paint
 * doesn't wait for a second request. Every build regenerates it from the current CSS.
 */
const inlineCss = (): Plugin => ({
  name: "inline-css",
  apply: (_config, { command, isSsrBuild }) => command === "build" && !isSsrBuild,
  transformIndexHtml: {
    order: "post",
    handler(html, { bundle }) {
      if (!bundle) return html;
      return html.replace(/<link rel="stylesheet"[^>]*href="\/([^"]+\.css)"[^>]*>/g, (tag, fileName: string) => {
        const asset = bundle[fileName];
        if (!asset || asset.type !== "asset") return tag;
        delete bundle[fileName];
        return `<style>${asset.source}</style>`;
      });
    },
  },
});

// https://vitejs.dev/config/
// Vite runs inside server.js (SSR), which also proxies the Django paths.
export default defineConfig(({ mode, isSsrBuild }) => ({
  server: {
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), inlineCss(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    copyPublicDir: !isSsrBuild,
    rollupOptions: {
      // The server build (dist/server) imports its dependencies from node_modules.
      output: isSsrBuild
        ? {}
        : {
            manualChunks: {
              "react-vendor": ["react", "react-dom", "react-router-dom"],
              "framer-motion": ["framer-motion"],
            },
          },
    },
  },
}));
