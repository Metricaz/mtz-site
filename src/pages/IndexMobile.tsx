import { lazy, Suspense } from "react";

const StatsSplit = lazy(() => import("@/components/site/StatsSplit").then((m) => ({ default: m.StatsSplit })));
const Method = lazy(() => import("@/components/site/Method").then((m) => ({ default: m.Method })));
const Models = lazy(() => import("@/components/site/Models").then((m) => ({ default: m.Models })));
const Logos = lazy(() => import("@/components/site/Logos").then((m) => ({ default: m.Logos })));
const Team = lazy(() => import("@/components/site/Team").then((m) => ({ default: m.Team })));
const Testimonials = lazy(() => import("@/components/site/Testimonials").then((m) => ({ default: m.Testimonials })));
const Cases = lazy(() => import("@/components/site/Cases").then((m) => ({ default: m.Cases })));
const Content = lazy(() => import("@/components/site/Content").then((m) => ({ default: m.Content })));
const FooterCTA = lazy(() => import("@/components/site/FooterCTA").then((m) => ({ default: m.FooterCTA })));
const Contact = lazy(() => import("@/components/site/Contact").then((m) => ({ default: m.Contact })));
const Footer = lazy(() => import("@/components/site/Footer").then((m) => ({ default: m.Footer })));

const IndexMobile = () => (
  <Suspense fallback={null}>
    <StatsSplit />
    <Method />
    <Models />
    <Logos />
    <Team />
    <Testimonials />
    <Cases />
    <Content />
    <FooterCTA />
    <Contact />
    <Footer />
  </Suspense>
);

export default IndexMobile;
