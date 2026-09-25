import { useSectors } from '@/hooks/useSectors';

export const Marquee = () => {
  const { sectors } = useSectors();

  if (sectors.length === 0) {
    return null;
  }

  const displayItems = sectors.map((s) => s.name);

  // Duplicar items para efeito de loop infinito
  const items = [...displayItems, ...displayItems];

  return (
    <div className="surface-orange overflow-hidden border-y border-primary-foreground/10">
      <div className="flex gap-12 py-6 md:py-7 marquee whitespace-nowrap">
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-12" style={{ color: "hsl(var(--ink))" }}>
            <span className="editorial text-3xl md:text-5xl">{t}</span>
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: "hsl(var(--ink))" }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
