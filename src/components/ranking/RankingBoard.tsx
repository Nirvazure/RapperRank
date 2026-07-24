"use client";

import { RankingItem } from "@/components/ranking/RankingItem";
import type { Rapper } from "@/features/rappers/rapper.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";
import { useEffect, useRef } from "react";
import gsap from "gsap";

export function RankingBoard({
  rappers,
  selectedRapperId,
  compact = false,
  favoriteIds,
  onToggleFavorite,
  onSelect,
}: {
  rappers: Rapper[];
  selectedRapperId?: string;
  compact?: boolean;
  favoriteIds?: Set<string>;
  onToggleFavorite?: (rapperId: string) => void;
  onSelect: (rapperId: string) => void;
}) {
  const boardRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        ".ranking-item, .ranking-rail-card",
        { opacity: 0, y: 14 },
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          stagger: 0.04,
          ease: "power2.out",
        },
      );
    }, boardRef);

    return () => context.revert();
  }, [rappers]);

  return (
    <section
      ref={boardRef}
      className={`rounded-lg border border-white/10 bg-zinc-950/90 text-white shadow-2xl shadow-black/30 ${
        compact ? "p-3" : "p-5"
      }`}
    >
      <div className={`flex items-end justify-between gap-4 ${compact ? "mb-3" : "mb-5"}`}>
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-lime-200">
            top 10
          </p>
          <h2 className={compact ? "text-lg font-black uppercase md:text-xl" : "text-3xl font-black uppercase"}>
            <span className="md:hidden">榜单</span>
            <span className="hidden md:inline">Ranking Board</span>
          </h2>
        </div>
        {!compact ? <span className="font-mono text-xs text-white/45">global average</span> : null}
      </div>

      {/* Mobile (&lt;md): horizontal rank rail */}
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 no-scrollbar md:hidden">
        {rappers.map((rapper, index) => {
          const rank = index + 1;
          const active = selectedRapperId ? rapper.id === selectedRapperId : false;
          const score = formatScore(
            rapper.overallScore ?? calculateOverallScore(rapper.averageRatings),
          );

          return (
            <button
              key={rapper.id}
              type="button"
              onClick={() => onSelect(rapper.id)}
              className={`ranking-rail-card flex w-[7.5rem] shrink-0 flex-col gap-2 rounded-lg border p-2.5 text-left transition ${
                active
                  ? "border-lime-200 bg-lime-200 text-black"
                  : "border-white/10 bg-black/50 text-white hover:border-lime-200/50"
              }`}
            >
              <span
                className={`font-mono text-2xl font-black leading-none ${
                  rank === 1 && !active ? "text-lime-200" : ""
                }`}
              >
                {rank.toString().padStart(2, "0")}
              </span>
              <span className="line-clamp-2 min-h-[2.25rem] text-xs font-black uppercase leading-tight">
                {rapper.name}
              </span>
              <span className={`font-mono text-sm font-black ${active ? "text-black" : "text-lime-200"}`}>
                {score}
              </span>
            </button>
          );
        })}
      </div>

      {/* md+: vertical list */}
      <div className="hidden gap-2 md:grid">
        {rappers.map((rapper, index) => (
          <RankingItem
            key={rapper.id}
            rapper={rapper}
            rank={index + 1}
            active={selectedRapperId ? rapper.id === selectedRapperId : false}
            compact={compact}
            isFavorite={favoriteIds?.has(rapper.id) ?? false}
            onToggleFavorite={
              onToggleFavorite ? () => onToggleFavorite(rapper.id) : undefined
            }
            onSelect={() => onSelect(rapper.id)}
          />
        ))}
      </div>
    </section>
  );
}
