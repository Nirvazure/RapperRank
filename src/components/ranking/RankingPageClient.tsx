"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { PageHeader } from "@/components/layout/PageHeader";
import { CommunityRapperList } from "@/components/ranking/CommunityRapperList";
import { RankingBoard } from "@/components/ranking/RankingBoard";
import { RapperGallery } from "@/components/rapper/RapperGallery";
import { useFavoriteIds } from "@/hooks/useFavoriteIds";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { CommunitySortMode, UserRating } from "@/features/ratings/rating.types";
import { sortRappersForCommunity } from "@/features/rappers/rapper.utils";

import type { ViewerPresentation } from "@/features/user/user.types";

const sortOptions: Array<{ value: CommunitySortMode; label: string }> = [
  { value: "score", label: "按分数" },
  { value: "fondness", label: "按喜爱度" },
];

export function RankingPageClient({
  rappers,
  ranking,
  favoriteIds: initialFavoriteIds,
  ratings,
  viewer,
}: {
  rappers: Rapper[];
  ranking: Rapper[];
  favoriteIds: string[];
  ratings: UserRating[];
  viewer: ViewerPresentation;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [sortMode, setSortMode] = useState<CommunitySortMode>("score");
  const { favoriteIds, toggleFavorite } = useFavoriteIds(initialFavoriteIds);
  const avatarRapper =
    rappers.find((rapper) => favoriteIds.has(rapper.id)) ?? rappers[0];
  const sortedRappers = useMemo(
    () => sortRappersForCommunity(rappers, sortMode),
    [rappers, sortMode],
  );
  const sortedRanking = useMemo(
    () => sortRappersForCommunity(ranking.length > 0 ? rappers : [], sortMode).slice(0, 10),
    [ranking.length, rappers, sortMode],
  );

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        ".ranking-title",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
      );
    }, pageRef);

    return () => context.revert();
  }, []);

  function openRapper(rapperId: string) {
    router.push(`/rank/${rapperId}`);
  }

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-[#050505] px-4 py-5 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
        <div className="ranking-title">
          <PageHeader
            eyebrow="community roster"
            title="Community"
            description={`浏览全量 Rapper 列表、排行榜，以及当前会话的 ${ratings.length} 条评分记录。`}
            user={{
              ...viewer,
              avatarRapper,
            }}
          />
        </div>
        <div className="flex w-full items-center gap-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setSortMode(option.value)}
              className={`min-h-10 flex-1 rounded-md border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] transition sm:flex-none ${
                sortMode === option.value
                  ? "border-lime-200 bg-lime-200 text-black"
                  : "border-white/10 bg-white/[0.04] text-white/65 hover:border-white/20 hover:bg-white/[0.08]"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Mobile / tablet: Top10 first, then compact full list */}
        <div className="flex flex-col gap-5 xl:hidden">
          <RankingBoard
            rappers={sortedRanking}
            compact
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onSelect={openRapper}
          />
          <CommunityRapperList
            rappers={sortedRappers}
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onSelect={openRapper}
          />
        </div>

        {/* Desktop: gallery + sticky board */}
        <div className="hidden gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          <RapperGallery
            rappers={sortedRappers}
            compact
            favoriteIds={favoriteIds}
            onToggleFavorite={toggleFavorite}
            onSelect={openRapper}
          />
          <aside className="xl:sticky xl:top-5 xl:self-start">
            <RankingBoard
              rappers={sortedRanking}
              compact
              favoriteIds={favoriteIds}
              onToggleFavorite={toggleFavorite}
              onSelect={openRapper}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
