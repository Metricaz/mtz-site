import { ChevronDown } from "lucide-react";
import { OptionText } from "@/components/site/OptionText";
import { FaqItem } from "@/lib/api-types";

/**
 * Perguntas frequentes (admin → Perguntas frequentes). Nothing without questions. Answers stay in the
 * HTML even when closed (<details>), so search engines and AI crawlers read them; the page adds the
 * matching FAQPage schema (faqSchema) to its <PageHead>.
 */
export const FaqSection = ({ items, className = "py-24 md:py-32" }: { items: FaqItem[]; className?: string }) => {
  if (items.length === 0) return null;

  return (
    <section id="perguntas-frequentes" className={className}>
      <div className="container-x">
        <OptionText
          k="faq.title"
          as="h2"
          className="editorial mb-10 text-4xl leading-tight md:mb-14 md:text-6xl"
          accentClassName="editorial-italic text-primary"
        />
        <div className="max-w-4xl divide-y divide-border border-y border-border">
          {items.map((item) => (
            <details key={item.id} className="group py-5 md:py-6">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-lg font-medium md:text-xl [&::-webkit-details-marker]:hidden">
                <h3>{item.question}</h3>
                <ChevronDown className="mt-1 h-5 w-5 flex-shrink-0 text-primary transition-transform group-open:rotate-180" aria-hidden="true" />
              </summary>
              <p className="mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
