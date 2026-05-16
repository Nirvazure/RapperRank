"use client";

import {
  RAPPER_IMAGE_PLACEHOLDER_LABEL,
  resolveRapperMedia,
} from "@/features/rappers/rapper.media";
import type { Rapper } from "@/features/rappers/rapper.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";
import { RATING_KEYS, RATING_LABELS } from "@/lib/constants";

export function RapperGallery({
  rappers,
  compact = false,
  onSelect,
}: {
  rappers: Rapper[];
  compact?: boolean;
  onSelect: (rapperId: string) => void;
}) {
  return (
    <section className={compact ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" : "grid gap-4 sm:grid-cols-2 xl:grid-cols-3"}>
      {rappers.map((rapper) => {
        const media = resolveRapperMedia(rapper);

        return (
          <button
            key={rapper.id}
            type="button"
            onClick={() => onSelect(rapper.id)}
            className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] text-left text-white transition duration-300 hover:-translate-y-1 hover:border-lime-200/70 hover:bg-white/10"
          >
            <div className={`relative overflow-hidden bg-black ${compact ? "aspect-[4/3]" : "aspect-[3/4]"}`}>
              {media.src ? (
                <img
                  src={media.src}
                  alt={media.alt}
                  className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-neutral-900 px-4 text-center">
                  <div>
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-lime-200/70">
                      {RAPPER_IMAGE_PLACEHOLDER_LABEL}
                    </p>
                    <p className="mt-2 text-xs font-black uppercase text-white/50">
                      {rapper.name}
                    </p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <span className={`absolute bottom-3 right-3 font-mono font-black text-lime-200 ${compact ? "text-2xl" : "text-3xl"}`}>
                {formatScore(calculateOverallScore(rapper.averageRatings))}
              </span>
            </div>
            <div className={compact ? "space-y-2 p-3" : "space-y-3 p-4"}>
              <div>
                <h2 className={compact ? "text-lg font-black uppercase leading-none" : "text-2xl font-black uppercase leading-none"}>
                  {rapper.name}
                </h2>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                  {rapper.region}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {rapper.tags.slice(0, compact ? 2 : 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-white/10 px-2 py-1 text-xs font-black uppercase text-white/65"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className={compact ? "grid grid-cols-3 gap-1.5 border-t border-white/10 pt-2" : "grid grid-cols-2 gap-2 border-t border-white/10 pt-3"}>
                {RATING_KEYS.map((key) => (
                  <div
                    key={key}
                    className={compact ? "flex items-center justify-between gap-1 rounded-md bg-black/30 px-1.5 py-1" : "flex items-center justify-between gap-2 rounded-md bg-black/30 px-2 py-1.5"}
                  >
                    <span className="truncate text-[10px] font-black uppercase text-white/45">
                      {RATING_LABELS[key]}
                    </span>
                    <span className="font-mono text-xs font-black text-lime-200">
                      {rapper.averageRatings[key].toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </button>
        );
      })}
    </section>
  );
}
