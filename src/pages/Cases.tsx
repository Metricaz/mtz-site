import { Nav } from '@/components/site/Nav';
import { OptionPageHead } from '@/components/PageHead';
import { Footer } from '@/components/site/Footer';
import { OptionText } from '@/components/site/OptionText';
import { CaseGrid } from '@/components/site/Cases';
import { useCases } from '@/hooks/useCases';

const CasesPage = () => {
  const { cases } = useCases();

  return (
    <main className="min-h-screen bg-background text-foreground">
      <OptionPageHead page="cases" crumb="Cases" />
      <Nav useHomeSectionLinks />

      {/* Same header copy as the home "Cases" section (keys cases.eyebrow / cases.title). */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <div className="mb-6">
            <OptionText k="cases.eyebrow" className="mono-tag rounded-full bg-primary/15 px-3 py-1.5 text-primary" />
          </div>
          <OptionText
            k="cases.title"
            as="h1"
            className="editorial text-[clamp(2.5rem,6vw,5.5rem)] leading-[0.95]"
            accentClassName="editorial-italic text-primary"
          />
        </div>
      </section>

      {cases.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="container-x">
            <CaseGrid cases={cases} headingLevel="h2" />
          </div>
        </section>
      )}

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default CasesPage;
