import type { ReactNode } from "react";
import { FavoriteBookmarkButton } from "@/components/favorites/FavoriteBookmarkButton";
import { RapperLabelStrip } from "@/components/labels/RapperLabelStrip";
import { resolveRapperMedia } from "@/features/rappers/rapper.media";
import type { Rapper } from "@/features/rappers/rapper.types";
import { RapperImage } from "@/components/rapper/RapperImage";

export function RapperMediaPanel({
  rapper,
  isFavorite,
  onToggleFavorite,
  actionSlot,
}: {
  rapper: Rapper;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  actionSlot?: ReactNode;
}) {
  const media = resolveRapperMedia(rapper);

  return (
    <section className="relative aspect-[3/4] h-full min-h-[360px] overflow-hidden rounded-lg border border-white/10 bg-black md:min-h-[460px] xl:aspect-auto xl:min-h-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,255,0,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(255,46,91,0.22),transparent_28%)]" />
      <div className="rapper-visual absolute inset-0">
        <RapperImage
          src={media.src}
          alt={media.alt}
          priority
          className="object-cover opacity-80 mix-blend-luminosity"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.18)_34%,rgba(0,0,0,0.08)_54%,rgba(0,0,0,0.92)_100%)]" />
      <div className="absolute left-4 top-4 rounded-md bg-lime-300 px-2.5 py-1 font-mono text-[11px] font-black uppercase text-black shadow-lg shadow-black/30">
        {rapper.region}
      </div>
      <div className="absolute right-4 top-4 flex items-center gap-2">
        {actionSlot}
        <FavoriteBookmarkButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-lime-200">
          featured artist
        </p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h1 className="min-w-0 shrink text-left text-4xl font-black uppercase leading-[0.85] text-white sm:text-5xl md:text-6xl">
            {rapper.name}
          </h1>
          <RapperLabelStrip
            rapper={rapper}
            variant="featured"
            align="end"
            className="mt-0"
          />
        </div>
        <p className="mt-2 line-clamp-2 max-w-xl text-sm font-black leading-5 text-white/85">
          {rapper.bio}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rapper.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/15 bg-black/35 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-lime-100 backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
