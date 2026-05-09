"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { PageHeader } from "@/components/layout/PageHeader";
import { RankingBoard } from "@/components/ranking/RankingBoard";
import { RapperGallery } from "@/components/rapper/RapperGallery";
import { useRappersQuery } from "@/features/rappers/rapper.queries";
import {
  calculateOverallScore,
  mergeUserRatingsIntoRappers,
} from "@/features/ratings/rating.utils";
import { useUserStore } from "@/features/user/user-store";

export function RankingPageClient() {
  const pageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { data: rappers = [] } = useRappersQuery();
  const selectedRapperId = useUserStore((state) => state.selectedRapperId);
  const myRatings = useUserStore((state) => state.myRatings);
  const selectRapper = useUserStore((state) => state.selectRapper);

  const displayRappers = useMemo(() => {
    return mergeUserRatingsIntoRappers(rappers, myRatings);
  }, [rappers, myRatings]);

  const displayRanking = useMemo(() => {
    return [...displayRappers].sort(
      (first, second) =>
        calculateOverallScore(second.averageRatings) -
        calculateOverallScore(first.averageRatings),
    ).slice(0, 10);
  }, [displayRappers]);

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

  function selectAndOpenRapper(rapperId: string) {
    selectRapper(rapperId);
    router.push(`/rank/${rapperId}`);
  }

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-7">
        <div className="ranking-title">
          <PageHeader
            eyebrow="community roster"
            title="Rapper Community"
            description="浏览完整 Rapper 列表，比较六维表现，并从右侧排行榜快速进入评分页。"
          />
        </div>
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          <RapperGallery
            rappers={displayRappers}
            compact
            onSelect={selectAndOpenRapper}
          />
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <RankingBoard
              rappers={displayRanking}
              selectedRapperId={selectedRapperId}
              compact
              onSelect={selectAndOpenRapper}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
