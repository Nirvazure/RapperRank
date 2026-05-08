"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { RankingBoard } from "@/components/ranking/RankingBoard";
import { RapperGallery } from "@/components/rapper/RapperGallery";
import { useRappersQuery } from "@/features/rappers/rapper.queries";
import { mergeUserRatingsIntoRappers } from "@/features/ratings/rating.utils";
import { useUserStore } from "@/features/user/user-store";

export function RankingPageClient() {
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: rappers = [] } = useRappersQuery();
  const selectedRapperId = useUserStore((state) => state.selectedRapperId);
  const myRatings = useUserStore((state) => state.myRatings);
  const selectRapper = useUserStore((state) => state.selectRapper);

  const displayRanking = useMemo(() => {
    return mergeUserRatingsIntoRappers(rappers, myRatings).sort(
      (first, second) =>
        Object.values(second.averageRatings).reduce((sum, value) => sum + value, 0) -
        Object.values(first.averageRatings).reduce((sum, value) => sum + value, 0),
    );
  }, [rappers, myRatings]);

  const displayRappers = useMemo(() => {
    return mergeUserRatingsIntoRappers(rappers, myRatings);
  }, [rappers, myRatings]);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".ranking-title",
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, duration: 0.75, ease: "power3.out" },
      );
    }, pageRef);

    return () => context.revert();
  }, []);

  function selectAndOpenHome(rapperId: string) {
    selectRapper(rapperId);
    router.push(`/?rapper=${rapperId}`);
  }

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-7">
        <header className="ranking-title border-b border-white/10 pb-6">
          <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-lime-200">
            global board
          </p>
          <h1 className="mt-3 text-5xl font-black uppercase leading-[0.86] sm:text-7xl">
            Roster / Ranking
          </h1>
        </header>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]">
          <RapperGallery rappers={displayRappers} onSelect={selectAndOpenHome} />
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <RankingBoard
              rappers={displayRanking}
              selectedRapperId={selectedRapperId}
              compact
              onSelect={selectAndOpenHome}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
