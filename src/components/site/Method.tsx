import { OptionText } from "@/components/site/OptionText";
import { useApiList } from "@/hooks/useApiList";
import { MethodStep } from "@/lib/api-types";
import { getServiceIcon } from "@/lib/service-icons";

export const Method = () => {
  const items = useApiList<MethodStep>("/method-steps/");

  if (items.length === 0) {
    return null;
  }

  // Number shown = position in the list (01, 02…); tags are comma-separated in the admin.
  const steps = items.map((step, index) => ({
    n: String(index + 1).padStart(2, "0"),
    icon: getServiceIcon(step.icon_name),
    t: step.title,
    d: step.text,
    tags: step.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
  }));

  return (
    <section id="metodo" className="surface-cream relative py-24 md:py-36">
      <div className="container-x">
        <div className="grid md:grid-cols-12 gap-10 items-end mb-16 md:mb-20">
          <div className="md:col-span-8">
            <OptionText k="method.eyebrow" as="div" className="eyebrow" />
            <OptionText
              k="method.title"
              as="h2"
              className="editorial mt-5 text-5xl md:text-8xl text-cream-foreground"
              accentClassName="editorial-italic text-primary"
            />
          </div>
          <OptionText
            k="method.description"
            as="p"
            className="md:col-span-4 text-lg leading-relaxed"
            style={{ color: "hsl(248 14% 38%)" }}
          />
        </div>

        <div className="border-t border-cream-foreground/15">
          {steps.map(({ n, icon: Icon, t, d, tags }, i) => (
            <div
              key={n}
              className="group grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-14 border-b border-cream-foreground/15 items-center"
            >
              {/* icon tile */}
              <div className="md:col-span-2">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-cream-deep grid place-items-center border border-cream-foreground/10 group-hover:bg-primary group-hover:border-primary transition-colors">
                  <Icon className="w-8 h-8 text-cream-foreground group-hover:text-primary-foreground transition-colors" strokeWidth={1.6} />
                </div>
              </div>

              {/* number */}
              <div className="md:col-span-3">
                <div className="editorial text-8xl md:text-[10rem] text-primary leading-none">
                  {n}
                </div>
              </div>

              {/* content */}
              <div className="md:col-span-5">
                <h3 className="editorial text-3xl md:text-5xl text-cream-foreground">{t}</h3>
                <p className="mt-4 text-base md:text-lg leading-relaxed max-w-md" style={{ color: "hsl(248 14% 38%)" }}>
                  {d}
                </p>
              </div>

              {/* tags */}
              <div className="md:col-span-2 flex md:flex-col flex-wrap gap-2 md:items-end">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="mono-tag px-3 py-1.5 rounded-full border border-cream-foreground/20 text-cream-foreground/70"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-primary pulse-dot" />
          <OptionText k="method.footnote" className="mono-tag text-cream-foreground" />
        </div>
      </div>
    </section>
  );
};
