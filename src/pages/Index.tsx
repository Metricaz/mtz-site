import { lazy, Suspense } from "react";
import { Nav } from "@/components/site/Nav";
import { OptionPageHead } from "@/components/PageHead";
import { Hero } from "@/components/site/Hero";
import { Marquee } from "@/components/site/Marquee";
import { Services } from "@/components/site/Services";
import { useFaq } from "@/hooks/useFaq";
import { faqSchema } from "@/lib/structured-data";

const IndexBelowFold = lazy(() => import("@/pages/IndexBelowFold"));

const Index = () => {
  // Same request the FAQ block below the fold makes (shared cache): its questions also go in the schema.
  const { items: faq } = useFaq("home");
  return (
    <main className="min-h-screen bg-background text-foreground">
      <OptionPageHead page="home" schema={() => faqSchema(faq)} />
      <Nav />
      <Hero />
      <Marquee />
      <Services />
      <Suspense fallback={null}>
        <IndexBelowFold />
      </Suspense>
    </main>
  );
};

export default Index;
