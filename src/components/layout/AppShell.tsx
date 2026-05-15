"use client";

import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
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
  const shellRef = useRef<HTMLElement>(null);
  const heroIntroContextRef = useRef<ReturnType<typeof gsap.context> | null>(
    null,
  );
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

  useLayoutEffect(() => {
    return () => {
      heroIntroContextRef.current?.revert();
      heroIntroContextRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    const rapperId = selectedRapper?.id;
    if (!rapperId || heroIntroContextRef.current) return;

    let cancelled = false;
    const rafId = requestAnimationFrame(() => {
      if (cancelled) return;
      const root = shellRef.current;
      if (!root) return;
      const heroes = gsap.utils.toArray<Element>(
        root.querySelectorAll(".hero-enter"),
      );
      if (heroes.length === 0) return;
      heroIntroContextRef.current = gsap.context(() => {
        gsap.fromTo(
          heroes,
          { opacity: 0, y: 34 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
          },
        );
      }, shellRef);
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
    };
  }, [selectedRapper?.id]);

  useLayoutEffect(() => {
    if (!selectedRapper) return;

    let dead = false;
    let panelContext: ReturnType<typeof gsap.context> | null = null;

    const rafId = requestAnimationFrame(() => {
      if (dead) return;
      const root = shellRef.current;
      if (!root) return;
      const panelTargets = gsap.utils.toArray<Element>(
        root.querySelectorAll(".rapper-visual, .score-panel"),
      );
      if (panelTargets.length === 0) return;
      panelContext = gsap.context(() => {
        gsap.fromTo(
          panelTargets,
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
    });

    return () => {
      dead = true;
      cancelAnimationFrame(rafId);
      panelContext?.revert();
    };
  }, [selectedRapperId, selectedRapper]);

  if (!selectedRapper) {
    return (
      <main
        ref={shellRef}
        className="min-h-screen overflow-hidden bg-[#050505] px-4 py-4 text-white sm:px-6 lg:px-8"
      >
        <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px]" />
        <div className="relative mx-auto flex max-w-[1600px] animate-pulse flex-col gap-4">
          <div className="flex flex-col gap-3 border-b border-white/10 pb-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-10 w-28 rounded-md bg-white/10" />
              <div className="space-y-2">
                <div className="h-3 w-36 rounded bg-lime-200/20" />
                <div className="h-8 w-56 rounded bg-white/10" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-24 rounded-md bg-white/10" />
              <div className="h-8 w-32 rounded-md bg-white/10" />
            </div>
          </div>
          <div className="grid gap-4 xl:min-h-[calc(100vh-140px)] xl:grid-cols-[minmax(360px,0.88fr)_minmax(520px,1.12fr)]">
            <div className="min-h-[360px] rounded-lg border border-white/10 bg-white/[0.06]" />
            <div className="grid gap-4 xl:grid-rows-[minmax(0,1fr)_minmax(0,0.62fr)]">
              <div className="min-h-[260px] rounded-lg border border-white/10 bg-white/[0.06]" />
              <div className="min-h-[180px] rounded-lg border border-white/10 bg-white/[0.06]" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      ref={shellRef}
      className="min-h-screen overflow-hidden bg-[#050505] px-4 py-4 text-white sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(217,255,0,0.14),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(255,46,91,0.16),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(0,190,255,0.12),transparent_32%)]" />

      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-4">
        <div className="hero-enter">
          <HeroHeader />
        </div>

        <div className="grid items-stretch gap-4 xl:min-h-[calc(100vh-140px)] xl:grid-cols-[minmax(360px,0.88fr)_minmax(520px,1.12fr)]">
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
                  className="h-10 border-white/20 bg-black/35 px-3 text-xs font-black text-white backdrop-blur hover:bg-white/15 hover:text-white"
                  onClick={openRandomRapper}
                >
                  <Shuffle className="size-4" />
                  换一个
                </Button>
              }
            />
          </div>
          <div className="hero-enter score-panel grid h-full grid-rows-[minmax(0,1fr)_minmax(0,0.62fr)] gap-4">
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
