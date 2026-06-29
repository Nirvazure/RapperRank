"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { PageHeader } from "@/components/layout/PageHeader";
import { RankingBoard } from "@/components/ranking/RankingBoard";
import { RapperGallery } from "@/components/rapper/RapperGallery";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { UserRating } from "@/features/ratings/rating.types";

import type { ViewerPresentation } from "@/features/user/user.types";

export function RankingPageClient({
  rappers,
  ranking,
  favoriteIds,
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
  const avatarRapper = rappers.find((rapper) => favoriteIds.includes(rapper.id)) ?? rappers[0];

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

  function openRapper(rapperSlug: string) {
    router.push(`/rank/${rapperSlug}`);
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
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]">
          <RapperGallery rappers={rappers} compact onSelect={openRapper} />
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <RankingBoard
              rappers={ranking}
              compact
              onSelect={(rapperId) => {
                const rapper = ranking.find((item) => item.id === rapperId);
                if (rapper?.slug) {
                  openRapper(rapper.slug);
                }
              }}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
