import { useApiList } from "@/hooks/useApiList";
import { Capability } from "@/lib/api-types";
import { getServiceIcon } from "@/lib/service-icons";

export const ServicesBar = () => {
  const items = useApiList<Capability>("/capabilities/");

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="surface-orange border-y border-primary-foreground/10">
      <div className="container-x">
        <ul className="grid grid-cols-2 md:grid-cols-6 divide-x divide-primary-foreground/15">
          {items.map(({ id, icon_name, label }, i) => {
            const Icon = getServiceIcon(icon_name);
            return (
            <li
              key={id}
              className={`flex items-center gap-3 px-4 md:px-5 py-5 ${
                i >= 2 ? "border-t md:border-t-0 border-primary-foreground/15" : ""
              }`}
            >
              <Icon className="w-4 h-4 text-primary-foreground shrink-0" strokeWidth={2} />
              <span className="mono-tag text-primary-foreground">{label}</span>
            </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
