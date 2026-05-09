"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Shuffle } from "lucide-react";
import { HeroHeader } from "@/components/layout/HeroHeader";
import { RatingDialog } from "@/components/ratings/RatingDialog";
import { Button } from "@/components/ui/button";
import { RapperMediaPanel } from "@/components/rapper/RapperMediaPanel";
import { RapperProfilePanel } from "@/components/rapper/RapperProfilePanel";
import { RapperRadarChart } from "@/components/rapper/RapperRadarChart";
import { useRappersQuery } from "@/features/rappers/rapper.queries";
import { getRapperById } from "@/features/rappers/rapper.utils";
import {
  getUserRatingForRapper,
  mergeUserRatingsIntoRappers,
} from "@/features/ratings/rating.utils";
import { useUserStore } from "@/features/user/user-store";

export function AppShell({ initialRapperId }: { initialRapperId: string }) {
  const shellRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: rappers = [] } = useRappersQuery();
  const selectedRapperId = useUserStore((state) => state.selectedRapperId);
  const favoriteRapperIds = useUserStore((state) => state.favoriteRapperIds);
  const myRatings = useUserStore((state) => state.myRatings);
  const selectRapper = useUserStore((state) => state.selectRapper);
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);
  const rateRapper = useUserStore((state) => state.rateRapper);

  useEffect(() => {
    if (initialRapperId && initialRapperId !== selectedRapperId) {
      selectRapper(initialRapperId);
    }
  }, [initialRapperId, selectRapper, selectedRapperId]);

  const displayRappers = useMemo(() => {
    return mergeUserRatingsIntoRappers(rappers, myRatings);
  }, [rappers, myRatings]);

  const selectedRapper = useMemo(() => {
    return getRapperById(displayRappers, initialRapperId) ?? displayRappers[0];
  }, [displayRappers, initialRapperId]);

  const myRating = selectedRapper
    ? getUserRatingForRapper(myRatings, selectedRapper.id)
    : undefined;

  function openRandomRapper() {
    const candidates = displayRappers.filter(
      (rapper) => rapper.id !== selectedRapper.id,
    );
    const pool = candidates.length > 0 ? candidates : [selectedRapper];
    const nextRapper = pool[Math.floor(Math.random() * pool.length)];

    selectRapper(nextRapper.id);
    router.push(`/rank/${nextRapper.id}`);
  }

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

      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-5">
        <div className="hero-enter">
          <HeroHeader />
        </div>

        <div className="grid items-stretch gap-6 xl:min-h-[calc(100vh-220px)] xl:grid-cols-[minmax(420px,0.9fr)_minmax(560px,1.1fr)]">
          <div className="hero-enter h-full">
            <RapperMediaPanel
              rapper={selectedRapper}
              isFavorite={favoriteRapperIds.includes(selectedRapper.id)}
              onToggleFavorite={() => toggleFavorite(selectedRapper.id)}
              actionSlot={
                <Button
                  type="button"
                  variant="outline"
                  aria-label="换一个"
                  className="h-11 border-white/20 bg-black/35 px-3 text-sm font-black text-white backdrop-blur hover:bg-white/15 hover:text-white"
                  onClick={openRandomRapper}
                >
                  <Shuffle className="size-4" />
                  换一个
                </Button>
              }
            />
          </div>
          <div className="hero-enter score-panel grid h-full grid-rows-[minmax(0,1fr)_minmax(0,0.75fr)] gap-4">
            <RapperRadarChart
              rapper={selectedRapper}
              actionSlot={
                <RatingDialog
                  rapper={selectedRapper}
                  value={myRating?.ratings}
                  triggerLabel="评分"
                  onChange={(ratings) => rateRapper(selectedRapper.id, ratings)}
                />
              }
            />
            <RapperProfilePanel rapper={selectedRapper} />
          </div>
        </div>
      </div>
    </main>
  );
}
