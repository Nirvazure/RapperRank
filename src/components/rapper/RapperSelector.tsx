"use client";

import type { Rapper } from "@/features/rappers/rapper.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

export function RapperSelector({
  rappers,
  selectedRapperId,
  onSelect,
}: {
  rappers: Rapper[];
  selectedRapperId: string;
  onSelect: (rapperId: string) => void;
}) {
  return (
    <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
      {rappers.map((rapper) => {
        const active = rapper.id === selectedRapperId;

        return (
          <button
            key={rapper.id}
            type="button"
            onClick={() => onSelect(rapper.id)}
            className={`group rounded-lg border p-2 text-left transition ${
              active
                ? "border-lime-200 bg-lime-200 text-black"
                : "border-white/10 bg-white/[0.06] text-white hover:border-white/30 hover:bg-white/10"
            }`}
          >
            <div className="flex items-center gap-3">
              <img
                src={rapper.avatarUrl}
                alt={rapper.name}
                className="size-10 rounded-md object-cover grayscale transition group-hover:grayscale-0"
              />
              <div className="min-w-0">
                <h3 className="truncate text-sm font-black uppercase">
                  {rapper.name}
                </h3>
                <p className={active ? "text-xs text-black/60" : "text-xs text-white/45"}>
                  {formatScore(calculateOverallScore(rapper.averageRatings))} / 5
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </section>
  );
}
