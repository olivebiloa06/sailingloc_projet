import { useRef, useState } from "react";

export default function Carousel({ items, renderItem }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(0);

  const cardStep = () => {
    const track = trackRef.current;
    const card = track?.querySelector("[data-carousel-item]");
    return card ? card.getBoundingClientRect().width + 24 : 300;
  };

  const scrollTo = (i) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * cardStep(), behavior: "smooth" });
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setActive(Math.round(track.scrollLeft / cardStep()));
  };

  return (
    <div>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto overflow-y-visible px-1 pb-3 pt-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {items.map((item, i) => (
          <div
            key={i}
            data-carousel-item
            style={{ scrollSnapAlign: "start" }}
            className="w-72 shrink-0 sm:w-80"
          >
            {renderItem(item)}
          </div>
        ))}
      </div>

      {items.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => scrollTo(Math.max(0, active - 1))}
            disabled={active === 0}
            aria-label="Précédent"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-navy transition hover:border-navy disabled:opacity-30"
          >
            ‹
          </button>

          <div className="flex gap-1.5">
            {items.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollTo(i)}
                aria-label={`Aller à l'élément ${i + 1}`}
                className={`h-1.5 w-1.5 rounded-full transition ${
                  i === active ? "bg-navy" : "bg-gray-300"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => scrollTo(Math.min(items.length - 1, active + 1))}
            disabled={active === items.length - 1}
            aria-label="Suivant"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-navy transition hover:border-navy disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
