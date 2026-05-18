"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { HeartOff } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EditableRatingsList } from "@/components/profile/EditableRatingsList";
import { RapperImage } from "@/components/rapper/RapperImage";
import { Button } from "@/components/ui/button";
import { resolveRapperMedia } from "@/features/rappers/rapper.media";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { RatingDimension, UserRating } from "@/features/ratings/rating.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

export function FavoritesPageClient({
  favoriteRappers,
  ratings,
  allRappers,
  viewerDisplayName,
}: {
  favoriteRappers: Rapper[];
  ratings: UserRating[];
  allRappers: Rapper[];
  viewerDisplayName: string;
}) {
  const pageRef = useRef<HTMLDivElement>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const router = useRouter();
  const avatarRapper = favoriteRappers[0] ?? allRappers[0];

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

  async function removeFavoriteWithMotion(rapperId: string) {
    if (removingId) {
      return;
    }

    const element = pageRef.current?.querySelector(`[data-favorite-id="${rapperId}"]`);
    setRemovingId(rapperId);

    const commitRemoval = async () => {
      const response = await fetch(`/api/me/favorites/${rapperId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        setRemovingId(null);
        return;
      }

      startTransition(() => {
        router.refresh();
      });
    };

    if (!element) {
      await commitRemoval();
      return;
    }

    gsap.to(element, {
      opacity: 0,
      y: 24,
      scale: 0.96,
      duration: 0.28,
      ease: "power2.in",
      onComplete: () => {
        void commitRemoval();
      },
    });
  }

  async function submitRating(rapperId: string, nextRatings: RatingDimension) {
    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rapperId,
        ratings: nextRatings,
      }),
    });

    if (!response.ok) {
      throw new Error("rating request failed");
    }

    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <main
      ref={pageRef}
      className="min-h-screen bg-[#050505] px-4 py-5 text-white sm:px-6 lg:px-8"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
        <PageHeader
          eyebrow="local profile"
          title="Personal Center"
          description="查看当前匿名会话的收藏列表与评分记录，所有数据都已持久化到后端。"
          user={{
            displayName: viewerDisplayName,
            avatarRapper,
          }}
        />

        <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:items-start">
          <div className="grid gap-4">
            <section className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-right">
                <p className="font-mono text-3xl font-black text-lime-200">
                  {favoriteRappers.length}
                </p>
                <p className="text-xs font-black uppercase text-white/45">favorites</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-right">
                <p className="font-mono text-3xl font-black text-lime-200">{ratings.length}</p>
                <p className="text-xs font-black uppercase text-white/45">ratings</p>
              </div>
            </section>

            {favoriteRappers.length === 0 ? (
              <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
                <h2 className="text-2xl font-black uppercase">还没有收藏 Rapper</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                  去详情页给喜欢的 Rapper 打分或收藏，刷新后数据会从后端继续读回来。
                </p>
                <Button asChild className="mt-5 bg-lime-200 text-black hover:bg-lime-100">
                  <Link href="/">去评分</Link>
                </Button>
              </section>
            ) : (
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {favoriteRappers.map((rapper) => {
                  const media = resolveRapperMedia(rapper);

                  return (
                    <article
                      key={rapper.id}
                      data-favorite-id={rapper.id}
                      className="favorite-card aspect-[3/4] overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]"
                    >
                      <div className="flex h-full flex-col">
                        <Link href={`/rank/${rapper.slug ?? rapper.id}`} className="relative block flex-1">
                          <RapperImage
                            src={media.src}
                            alt={media.alt}
                            className="object-cover grayscale transition duration-300 hover:grayscale-0"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.18)_50%,rgba(0,0,0,0.9)_100%)]" />
                        </Link>
                        <div className="space-y-2 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h2 className="truncate text-lg font-black uppercase">{rapper.name}</h2>
                              <p className="text-[11px] text-white/45">{rapper.region}</p>
                            </div>
                            <span className="font-mono text-lg font-black text-lime-200">
                              {formatScore(calculateOverallScore(rapper.averageRatings))}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {rapper.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-black uppercase text-white/65"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={removingId === rapper.id}
                            className="h-8 w-full border-white/15 bg-black/30 text-[11px] text-white hover:bg-red-500 hover:text-white"
                            onClick={() => removeFavoriteWithMotion(rapper.id)}
                          >
                            <HeartOff className="size-4" />
                            取消收藏
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </div>

          <EditableRatingsList
            rappers={allRappers}
            ratings={ratings}
            viewerDisplayName={viewerDisplayName}
            onChangeRating={submitRating}
          />
        </div>
      </div>
    </main>
  );
}
