import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === 'production' ? '/metricaz/' : '/',
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
    // Django (backend/, `manage.py runserver`) behind the same origin, so its session cookie works in dev.
    proxy: Object.fromEntries(
      ["/api", "/admin", "/static", "/media", "/dashboard/login", "/dashboard/logout"].map((path) => [
        path,
        process.env.DJANGO_DEV_SERVER || "http://127.0.0.1:8000",
      ]),
    ),
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "framer-motion": ["framer-motion"],
        },
      },
    },
  },
}));
