import { StatsSplit } from "@/components/site/StatsSplit";
import { Method } from "@/components/site/Method";
import { Models } from "@/components/site/Models";
import { Logos } from "@/components/site/Logos";
import { Team } from "@/components/site/Team";
import { Testimonials } from "@/components/site/Testimonials";
import { Cases } from "@/components/site/Cases";
import { Content } from "@/components/site/Content";
import { FooterCTA } from "@/components/site/FooterCTA";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";

const IndexBelowFold = () => (
  <>
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
  </>
);

export default IndexBelowFold;
