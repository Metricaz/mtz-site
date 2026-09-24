import { type PointerEvent, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTeam } from "@/hooks/useTeam";
import { OptionText } from "@/components/site/OptionText";

export const Team = () => {
  const { team: teamData } = useTeam({ placement: 'home' });
  const trackRef = useRef<HTMLDivElement>(null);
  const stepRef = useRef<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches);
  const [isHovered, setIsHovered] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const displayTeam = teamData;

  // Cache the card width + gap so we don't force a layout read on every auto-scroll tick.
  const getStep = (track: HTMLDivElement) => {
    if (stepRef.current !== null) return stepRef.current;

    const firstChild = track.firstElementChild as HTMLElement | null;
    const childWidth = firstChild?.getBoundingClientRect().width || track.clientWidth * 0.9;
    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const step = childWidth + gap;
    stepRef.current = step;
    return step;
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    const updateScrollState = () => {
      setCanScrollPrev(track.scrollLeft > 0);
      setCanScrollNext(track.scrollLeft + track.clientWidth < track.scrollWidth - 1);
    };

    const invalidateStep = () => {
      stepRef.current = null;
      updateScrollState();
    };

    updateViewport();
    updateScrollState();
    track.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", invalidateStep);
    mediaQuery.addEventListener?.("change", updateViewport);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", invalidateStep);
      mediaQuery.removeEventListener?.("change", updateViewport);
    };
  }, []);

  const scrollByPage = (direction: number) => {
    const track = trackRef.current;
    if (!track) return;

    const step = getStep(track);
    track.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const prev = () => scrollByPage(-1);
  const next = () => scrollByPage(1);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || isDragging || isHovered || isMobile || displayTeam.length <= 1) return;

    const intervalId = window.setInterval(() => {
      const step = getStep(track);
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - step * 0.5;

      if (atEnd) {
        track.scrollTo({ left: 0, behavior: "smooth" });
        return;
      }

      track.scrollBy({ left: step, behavior: "smooth" });
    }, 3000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [displayTeam.length, isDragging, isHovered, isMobile]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track) return;

    setIsDragging(true);
    setStartX(event.clientX);
    setScrollLeft(track.scrollLeft);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const track = trackRef.current;
    if (!track || !isDragging) return;

    const walk = event.clientX - startX;
    track.scrollLeft = scrollLeft - walk;
  };

  const endDrag = (event?: PointerEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (event) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  if (displayTeam.length === 0) {
    return null;
  }

  return (
    <section id="time" className="bg-ink-deep border-y border-border py-24 md:py-36 overflow-hidden">
      <div className="container-x">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14 md:mb-20">
          <div>
            <OptionText k="team.eyebrow" as="div" className="eyebrow" />
            <OptionText
              k="team.title"
              as="h2"
              className="editorial mt-5 text-5xl md:text-7xl"
              accentClassName="editorial-italic text-primary"
            />
          </div>
          <div className="flex items-end justify-between md:justify-end gap-6">
            <OptionText k="team.subtitle" as="p" className="mono-tag text-muted-foreground max-w-xs" />
            <div className="flex items-center gap-2 shrink-0">
              <button
                aria-label="Anterior"
                onClick={prev}
                disabled={!canScrollPrev}
                className="w-11 h-11 rounded-full border border-border text-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground transition-colors grid place-items-center"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                aria-label="Próximo"
                onClick={next}
                disabled={!canScrollNext}
                className="w-11 h-11 rounded-full border border-border text-foreground hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-border disabled:hover:text-foreground transition-colors grid place-items-center"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="relative">
          <div
            ref={trackRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`flex gap-6 overflow-x-auto scroll-smooth ${isDragging ? "cursor-grabbing" : "cursor-grab"} select-none scrollbar-none snap-x snap-mandatory pb-4`}
            style={{ touchAction: "pan-x" }}
          >
            {displayTeam.map((person, i) => {
              const initials = getInitials(person.name);
              const hasImage = Boolean(person.photo);

              return (
                <div
                  key={i}
                  className="shrink-0 min-w-[85%] md:min-w-[calc((100%-4.5rem)/3.3)] group relative rounded-3xl overflow-hidden bg-ink border border-border aspect-[3/4] flex flex-col justify-end snap-start"
                >
                  {/* Background */}
                  {hasImage ? (
                    <>
                      <img
                        src={person.photo}
                        alt={person.photo_alt || person.name}
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                          filter: 'grayscale(100%) hue-rotate(200deg) saturate(0.6) brightness(1.1) contrast(1.1)'
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-ink-deep/50 to-ink-deep" />
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-b from-ink-soft via-ink to-ink-deep" />
                      <div className="absolute inset-x-0 top-1/4 flex justify-center">
                        <div className="w-40 h-40 rounded-full bg-ink-soft grid place-items-center">
                          <span className="editorial text-5xl text-primary/40">{initials}</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Info */}
                  <div className="relative p-6 md:p-8 bg-gradient-to-t from-ink-deep via-ink-deep/85 to-transparent">
                    <h3 className="editorial text-2xl md:text-3xl text-foreground">{person.name}</h3>
                    <p className="mono-tag text-muted-foreground mt-2">{person.role}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

