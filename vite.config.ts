import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
// Vite runs inside server.js (SSR), which also proxies the Django paths.
export default defineConfig(({ mode, isSsrBuild }) => ({
  server: {
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
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
