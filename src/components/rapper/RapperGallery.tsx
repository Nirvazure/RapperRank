"use client";

import type { Rapper } from "@/features/rappers/rapper.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

export function RapperGallery({
  rappers,
  onSelect,
}: {
  rappers: Rapper[];
  onSelect: (rapperId: string) => void;
}) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {rappers.map((rapper) => (
        <button
          key={rapper.id}
          type="button"
          onClick={() => onSelect(rapper.id)}
          className="group overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] text-left text-white transition duration-300 hover:-translate-y-1 hover:border-lime-200/70 hover:bg-white/10"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-black">
            <img
              src={rapper.mediaUrl}
              alt={rapper.name}
              className="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
            <span className="absolute bottom-3 right-3 font-mono text-3xl font-black text-lime-200">
              {formatScore(calculateOverallScore(rapper.averageRatings))}
            </span>
          </div>
          <div className="space-y-3 p-4">
            <div>
              <h2 className="text-2xl font-black uppercase leading-none">
                {rapper.name}
              </h2>
              <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-white/45">
                {rapper.region}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {rapper.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/10 px-2 py-1 text-xs font-black uppercase text-white/65"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </button>
      ))}
    </section>
  );
}
