import { lazy, Suspense } from "react";
import { Nav } from "@/components/site/Nav";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Services } from "@/components/site/Services";

const IndexBelowFold = lazy(() => import("@/pages/IndexBelowFold"));

const Index = () => (
  <main className="min-h-screen bg-background text-foreground">
    <Nav />
    <Hero />
    <Marquee />
    <Services />
    <Suspense fallback={null}>
      <IndexBelowFold />
    </Suspense>
  </main>
);

export default Index;
