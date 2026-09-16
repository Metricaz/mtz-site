import { lazy, Suspense, useEffect, useState } from "react";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Services } from "@/components/site/Services";

const LazyIndexDesktop = lazy(() => import("@/pages/IndexDesktop"));
const LazyBelowFoldMobile = lazy(() => import("@/pages/IndexMobile"));

const isMobileViewport = () => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;

const Index = () => {
  const [isMobile, setIsMobile] = useState<boolean>(() => isMobileViewport());

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener?.("change", updateViewport);

    return () => mediaQuery.removeEventListener?.("change", updateViewport);
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      <Marquee />
      <Services />
      <Suspense fallback={null}>
        {isMobile ? <LazyBelowFoldMobile /> : <LazyIndexDesktop />}
      </Suspense>
    </main>
  );
};

export default Index;

