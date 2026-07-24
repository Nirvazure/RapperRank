"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { RapperAvatar } from "@/components/rapper/RapperAvatar";
import { FavoriteBookmarkButton } from "@/components/favorites/FavoriteBookmarkButton";
import type { Rapper } from "@/features/rappers/rapper.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

export function CommunityRapperList({
  rappers,
  favoriteIds,
  onToggleFavorite,
  onSelect,
}: {
  rappers: Rapper[];
  favoriteIds: Set<string>;
  onToggleFavorite: (rapperId: string) => void;
  onSelect: (rapperId: string) => void;
}) {
  const listRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = listRef.current;
    if (!root) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        ".community-list-row",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          stagger: 0.03,
          ease: "power2.out",
        },
      );
    }, listRef);

    return () => context.revert();
  }, [rappers]);

  return (
    <section ref={listRef} className="flex flex-col gap-2">
      <div className="flex items-end justify-between gap-3 px-0.5">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-lime-200">
            full roster
          </p>
          <h2 className="text-lg font-black uppercase">全部歌手</h2>
        </div>
        <span className="font-mono text-xs text-white/45">{rappers.length}</span>
      </div>

      <ul className="grid gap-1.5">
        {rappers.map((rapper, index) => {
          const isFavorite = favoriteIds.has(rapper.id);
          const score = formatScore(
            rapper.overallScore ?? calculateOverallScore(rapper.averageRatings),
          );

          return (
            <li key={rapper.id}>
              <div className="community-list-row flex items-center gap-2 rounded-lg border border-white/10 bg-black/40 px-2 py-2 transition hover:border-white/25 hover:bg-white/[0.06]">
                <button
                  type="button"
                  onClick={() => onSelect(rapper.id)}
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                >
                  <span className="w-8 shrink-0 font-mono text-sm font-black tabular-nums text-white/40">
                    {(index + 1).toString().padStart(2, "0")}
                  </span>
                  <RapperAvatar rapper={rapper} sizeClass="size-11 shrink-0" grayscale />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-black uppercase leading-tight text-white">
                      {rapper.name}
                    </h3>
                    <p className="mt-0.5 truncate text-[10px] font-bold uppercase tracking-[0.14em] text-white/45">
                      {rapper.region}
                    </p>
                  </div>
                  <span className="shrink-0 font-mono text-base font-black text-lime-200">
                    {score}
                  </span>
                </button>
                <FavoriteBookmarkButton
                  compact
                  isFavorite={isFavorite}
                  onToggle={() => onToggleFavorite(rapper.id)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
