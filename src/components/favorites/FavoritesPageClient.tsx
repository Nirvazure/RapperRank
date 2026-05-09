"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { HeartOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EditableRatingsList } from "@/components/profile/EditableRatingsList";
import { Button } from "@/components/ui/button";
import { useRappersQuery } from "@/features/rappers/rapper.queries";
import {
  calculateOverallScore,
  formatScore,
  mergeUserRatingsIntoRappers,
} from "@/features/ratings/rating.utils";
import { useUserStore } from "@/features/user/user-store";

export function FavoritesPageClient() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const { data: rappers = [] } = useRappersQuery();
  const favoriteRapperIds = useUserStore((state) => state.favoriteRapperIds);
  const myRatings = useUserStore((state) => state.myRatings);
  const toggleFavorite = useUserStore((state) => state.toggleFavorite);
  const rateRapper = useUserStore((state) => state.rateRapper);

  const favoriteRappers = useMemo(() => {
    return mergeUserRatingsIntoRappers(rappers, myRatings).filter((rapper) =>
      favoriteRapperIds.includes(rapper.id),
    );
  }, [rappers, myRatings, favoriteRapperIds]);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".favorite-card",
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.07, ease: "power3.out" },
      );
    }, pageRef);

    return () => context.revert();
  }, [favoriteRappers]);

  function removeFavoriteWithMotion(rapperId: string) {
    if (removingId) {
      return;
    }

    const element = pageRef.current?.querySelector(
      `[data-favorite-id="${rapperId}"]`,
    );

    setRemovingId(rapperId);

    if (!element) {
      toggleFavorite(rapperId);
      setRemovingId(null);
      return;
    }

    gsap.to(element, {
      opacity: 0,
      y: 24,
      scale: 0.96,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => {
        toggleFavorite(rapperId);
        setRemovingId(null);
      },
    });
  }

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-[#050505] px-4 py-8 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-7">
        <PageHeader
          eyebrow="local profile"
          title="Personal Center"
          description="查看本地收藏与评分记录，并直接修改已经提交过的评分。"
        />
        <section className="grid grid-cols-2 gap-2 sm:max-w-sm">
          <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-right">
            <p className="font-mono text-3xl font-black text-lime-200">
              {favoriteRapperIds.length}
            </p>
            <p className="text-xs font-black uppercase text-white/45">favorites</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-right">
            <p className="font-mono text-3xl font-black text-lime-200">
              {myRatings.length}
            </p>
            <p className="text-xs font-black uppercase text-white/45">ratings</p>
          </div>
        </section>

        {favoriteRappers.length === 0 ? (
          <section className="rounded-lg border border-white/10 bg-white/[0.06] p-8">
            <h2 className="text-3xl font-black uppercase">还没有收藏 Rapper</h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">
              去评分页随机发现一个 Rapper，再把喜欢的对象加入本地收藏。
            </p>
            <Button asChild className="mt-5 bg-lime-200 text-black hover:bg-lime-100">
              <Link href="/">去评分</Link>
            </Button>
          </section>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {favoriteRappers.map((rapper) => (
              <article
                key={rapper.id}
                data-favorite-id={rapper.id}
                className="favorite-card overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]"
              >
                <Link href={`/rank/${rapper.id}`} className="block">
                  <img
                    src={rapper.mediaUrl}
                    alt={rapper.name}
                    className="h-56 w-full object-cover grayscale transition duration-300 hover:grayscale-0"
                  />
                </Link>
                <div className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-black uppercase">
                        {rapper.name}
                      </h2>
                      <p className="text-sm text-white/45">{rapper.region}</p>
                    </div>
                    <span className="font-mono text-2xl font-black text-lime-200">
                      {formatScore(calculateOverallScore(rapper.averageRatings))}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {rapper.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/10 px-2 py-1 text-xs font-black uppercase text-white/65"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={removingId === rapper.id}
                    className="w-full border-white/15 bg-black/30 text-white hover:bg-red-500 hover:text-white"
                    onClick={() => removeFavoriteWithMotion(rapper.id)}
                  >
                    <HeartOff className="size-4" />
                    取消收藏
                  </Button>
                </div>
              </article>
            ))}
          </section>
        )}
        <EditableRatingsList
          rappers={rappers}
          ratings={myRatings}
          onChangeRating={rateRapper}
        />
      </div>
    </main>
  );
}
