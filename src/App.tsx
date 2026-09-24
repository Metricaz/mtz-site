import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { SiteOptionsProvider } from "@/components/SiteOptionsProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index.tsx";
import { WhatsAppFloatingButton } from "@/components/site/WhatsAppFloatingButton";

// Code-split routes so heavy, dashboard-only dependencies (recharts, dashboard lists)
// don't ship in the public site's initial bundle.
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })));
const CasePage = lazy(() => import("./pages/CasePage"));
const About = lazy(() => import("./pages/About"));
const ServicesPage = lazy(() => import("./pages/Services"));
const ServicePage = lazy(() => import("./pages/ServicePage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const BlogPage = lazy(() => import("./pages/Blog"));
const BlogPostPage = lazy(() => import("./pages/BlogPost"));

const queryClient = new QueryClient();

const MetricazPrefixRedirect = () => {
  const location = useLocation();
  const nextPath = location.pathname.replace(/^\/metricaz(?=\/|$)/, "") || "/";

  return <Navigate to={`${nextPath}${location.search}${location.hash}`} replace />;
};

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      return;
    }

    const hash = location.hash;
     if (hash === "#top") {
       window.scrollTo({ top: 0, left: 0, behavior: "auto" });
       return;
     }

    const scrollToTarget = () => {
       const targetElement = document.querySelector(hash);

      if (targetElement instanceof HTMLElement) {
        targetElement.scrollIntoView({ behavior: "auto", block: "start" });
        return;
      }

      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    const frame = window.requestAnimationFrame(scrollToTarget);
    return () => window.cancelAnimationFrame(frame);
  }, [location.pathname, location.hash]);

  return null;
};

const isRootBase = import.meta.env.BASE_URL === "/";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SiteOptionsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <ScrollToTop />
          <Suspense fallback={null}>
            <Routes>
              {isRootBase && <Route path="/metricaz/*" element={<MetricazPrefixRedirect />} />}
              <Route path="/" element={<Index />} />
              <Route path="/quem-somos" element={<About />} />
              <Route path="/servicos" element={<ServicesPage />} />
              <Route path="/servicos/:slug" element={<ServicePage />} />
              <Route path="/contato" element={<ContactPage />} />
              <Route path="/cases/:slug" element={<CasePage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/dashboard" element={<Navigate to="/dashboard/sectors" replace />} />
              <Route
                path="/dashboard/:section"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <WhatsAppFloatingButton />
        </BrowserRouter>
        </SiteOptionsProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
