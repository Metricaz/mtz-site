interface ItemBadgesProps {
  isActive: boolean;
  places?: string[];
}

/** "Inativo" when the item is switched off in the admin, plus where it appears on the site. */
export const ItemBadges = ({ isActive, places = [] }: ItemBadgesProps) => (
  <span className="inline-flex flex-wrap items-center gap-1.5">
    {!isActive && (
      <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        Inativo
      </span>
    )}
    {places.map((place) => (
      <span key={place} className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
        {place}
      </span>
    ))}
  </span>
);
