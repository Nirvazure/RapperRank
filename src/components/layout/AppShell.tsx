"use client";

import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";
import { HeroHeader } from "@/components/layout/HeroHeader";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { RatingDialog } from "@/components/ratings/RatingDialog";
import { RapperMediaPanel } from "@/components/rapper/RapperMediaPanel";
import { RapperProfilePanel } from "@/components/rapper/RapperProfilePanel";
import { RapperRadarChart } from "@/components/rapper/RapperRadarChart";
import { RapperSelector } from "@/components/rapper/RapperSelector";
import { useRappersQuery } from "@/features/rappers/rapper.queries";
import { getRapperById } from "@/features/rappers/rapper.utils";
import {
  getUserRatingForRapper,
  mergeUserRatingsIntoRappers,
} from "@/features/ratings/rating.utils";
import { useUserStore } from "@/features/user/user-store";

export function AppShell() {
  const shellRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const { data: rappers = [] } = useRappersQuery();
  const selectedRapperId = useUserStore((state) => state.selectedRapperId);
  const favoriteRapperIds = useUserStore((state) => state.favoriteRapperIds);
  const myRatings = useUserStore((state) => state.myRatings);
  const selectRapper = useUserStore((state) => state.selectRapper);
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);
  const rateRapper = useUserStore((state) => state.rateRapper);

  useEffect(() => {
    const rapperId = searchParams.get("rapper");
    if (rapperId && rapperId !== selectedRapperId) {
      selectRapper(rapperId);
    }
  }, [searchParams, selectRapper, selectedRapperId]);

  const displayRappers = useMemo(() => {
    return mergeUserRatingsIntoRappers(rappers, myRatings);
  }, [rappers, myRatings]);

  const selectedRapper = useMemo(() => {
    return getRapperById(displayRappers, selectedRapperId) ?? displayRappers[0];
  }, [displayRappers, selectedRapperId]);

  const myRating = selectedRapper
    ? getUserRatingForRapper(myRatings, selectedRapper.id)
    : undefined;

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".hero-enter",
        { opacity: 0, y: 34 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: "power3.out" },
      );
    }, shellRef);

    return () => context.revert();
  }, []);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        [".rapper-visual", ".score-panel"],
        { opacity: 0.45, scale: 1.03, y: 18 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.72,
          stagger: 0.06,
          ease: "power3.out",
        },
      );
    }, shellRef);

    return () => context.revert();
  }, [selectedRapperId]);

  if (!selectedRapper) {
    return (
      <main className="min-h-screen bg-black px-5 py-8 text-white">
        正在加载 RapperRank...
      </main>
    );
  }

  return (
    <main
      ref={shellRef}
      className="min-h-[calc(100vh-57px)] overflow-hidden bg-[#050505] px-4 py-5 text-white sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(217,255,0,0.14),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(255,46,91,0.16),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(0,190,255,0.12),transparent_32%)]" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-5">
        <div className="hero-enter">
          <HeroHeader />
        </div>

        <ScrollReveal>
          <RapperSelector
            rappers={displayRappers}
            selectedRapperId={selectedRapper.id}
            onSelect={selectRapper}
          />
        </ScrollReveal>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(360px,0.88fr)_minmax(420px,1.12fr)]">
          <div className="hero-enter">
            <RapperMediaPanel
              rapper={selectedRapper}
              isFavorite={favoriteRapperIds.includes(selectedRapper.id)}
              onToggleFavorite={() => toggleFavorite(selectedRapper.id)}
            />
          </div>
          <div className="hero-enter score-panel grid content-start gap-4">
            <RapperRadarChart rapper={selectedRapper} />
            <RatingDialog
              rapper={selectedRapper}
              value={myRating?.ratings}
              onChange={(ratings) => rateRapper(selectedRapper.id, ratings)}
            />
            <RapperProfilePanel rapper={selectedRapper} />
          </div>
        </div>
      </div>
    </main>
  );
}
