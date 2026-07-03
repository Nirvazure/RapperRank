"use client";

import { RankingItem } from "@/components/ranking/RankingItem";
import type { Rapper } from "@/features/rappers/rapper.types";
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
    const context = gsap.context(() => {
      gsap.fromTo(
        ".ranking-item",
        { opacity: 0, x: -28 },
        {
          opacity: 1,
          x: 0,
          duration: 0.55,
          stagger: 0.055,
          ease: "power3.out",
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
          <h2 className={compact ? "text-xl font-black uppercase" : "text-3xl font-black uppercase"}>
            Ranking Board
          </h2>
        </div>
        {!compact ? <span className="font-mono text-xs text-white/45">global average</span> : null}
      </div>
      <div className="grid gap-2">
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
