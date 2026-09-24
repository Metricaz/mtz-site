import { OptionText } from "@/components/site/OptionText";
import { useApiList } from "@/hooks/useApiList";
import { EngagementModel } from "@/lib/api-types";
import { getServiceIcon } from "@/lib/service-icons";

export const Models = () => {
  const { items } = useApiList<EngagementModel>("/engagement-models/");

  if (items.length === 0) {
    return null;
  }

  // Number shown = position in the list (01, 02…).
  const models = items.map((model, index) => ({
    icon: getServiceIcon(model.icon_name),
    n: String(index + 1).padStart(2, "0"),
    t: model.title,
    d: model.text,
  }));

  return (
    <section className="py-24 md:py-36 bg-ink-deep border-y border-border">
      <div className="container-x">
        <div className="max-w-3xl mb-16 md:mb-20">
          <OptionText k="models.eyebrow" as="div" className="eyebrow" />
          <OptionText
            k="models.title"
            as="h2"
            className="editorial mt-5 text-5xl md:text-7xl"
            accentClassName="editorial-italic text-primary"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-border border border-border rounded-3xl overflow-hidden">
          {models.map(({ icon: Icon, n, t, d }) => (
            <div
              key={n}
              className="relative group p-8 md:p-10 bg-ink min-h-[340px] flex flex-col justify-between hover:bg-ink-soft transition-colors"
            >
              <div className="flex items-start justify-between">
                <span className="editorial text-4xl text-primary">{n}</span>
                <Icon className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div>
                <h3 className="editorial text-3xl md:text-4xl mb-4">{t}</h3>
                <p className="text-muted-foreground leading-relaxed">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
