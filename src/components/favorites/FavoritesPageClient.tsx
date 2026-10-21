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
import type { RatingSubmission, ViewerRatingListResponse } from "@/features/ratings/rating.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";
import type { ViewerPresentation } from "@/features/user/user.types";

export function FavoritesPageClient({
  favoriteRappers,
  ratingsPage,
  viewer,
}: {
  favoriteRappers: Rapper[];
  ratingsPage: ViewerRatingListResponse;
  viewer: ViewerPresentation;
}) {
  const pageRef = useRef<HTMLElement>(null);
  const requestIdRef = useRef(0);
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [activeRatingsPage, setActiveRatingsPage] = useState(ratingsPage);
  const [ratingsLoading, setRatingsLoading] = useState(false);
  const [ratingsError, setRatingsError] = useState<string | null>(null);
  const [syncedRatingsPage, setSyncedRatingsPage] = useState(ratingsPage);
  const avatarRapper = favoriteRappers[0];

  if (ratingsPage !== syncedRatingsPage) {
    setSyncedRatingsPage(ratingsPage);
    setActiveRatingsPage(ratingsPage);
    setRatingsLoading(false);
    setRatingsError(null);
  }

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

  async function loadRatingsPage(page: number) {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setRatingsLoading(true);
    setRatingsError(null);

    try {
      const response = await fetch(`/api/me/ratings?page=${page}&pageSize=${activeRatingsPage.pageSize}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("ratings request failed");
      }

      const nextRatingsPage = (await response.json()) as ViewerRatingListResponse;
      if (requestId === requestIdRef.current) {
        setActiveRatingsPage(nextRatingsPage);
      }

      return nextRatingsPage;
    } catch {
      if (requestId === requestIdRef.current) {
        setRatingsError("Failed to load ratings. Please try again.");
      }

      return null;
    } finally {
      if (requestId === requestIdRef.current) {
        setRatingsLoading(false);
      }
    }
  }

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

  async function submitRating(rapperId: string, submission: RatingSubmission) {
    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rapperId,
        ratings: submission.ratings,
        fondness: submission.fondness,
      }),
    });

    if (!response.ok) {
      throw new Error("rating request failed");
    }

    await loadRatingsPage(1);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <main
      ref={pageRef}
      className="min-h-[calc(100dvh-var(--rr-chrome-offset,0px))] bg-[#050505] px-4 py-4 text-white sm:px-6 sm:py-5 lg:px-8"
    >
      <div className="mx-auto flex max-w-[1600px] flex-col gap-5">
        <PageHeader
          eyebrow="local profile"
          title="Personal Center"
          description="Review your saved rappers and recent scores in one place."
          user={{
            ...viewer,
            avatarRapper,
          }}
        />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] xl:items-start">
          <div className="grid gap-4">
            <section className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-right">
                <p className="font-mono text-3xl font-black text-lime-200">
                  {favoriteRappers.length}
                </p>
                <p className="text-xs font-black uppercase text-white/45">favorites</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-right">
                <p className="font-mono text-3xl font-black text-lime-200">
                  {activeRatingsPage.total}
                </p>
                <p className="text-xs font-black uppercase text-white/45">ratings</p>
              </div>
            </section>

            {favoriteRappers.length === 0 ? (
              <section className="rounded-lg border border-white/10 bg-white/[0.06] p-6">
                <h2 className="text-2xl font-black uppercase">No favorite rappers yet</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-white/55">
                  Rate or save artists from their detail pages and they will show up here.
                </p>
                <Button asChild className="mt-5 min-h-11 bg-lime-200 text-black hover:bg-lime-100 sm:min-h-0">
                  <Link href="/">Start exploring</Link>
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
                      className="favorite-card overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] sm:aspect-[3/4]"
                    >
                      <div className="flex min-h-44 sm:h-full sm:flex-col">
                        <Link href={`/rank/${rapper.id}`} aria-label={`查看 ${rapper.name}`} className="relative block w-24 shrink-0 sm:w-auto sm:flex-1">
                          <RapperImage
                            src={media.src}
                            alt={media.alt}
                            className="object-cover grayscale transition duration-300 hover:grayscale-0"
                          />
                          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.08)_0%,rgba(0,0,0,0.18)_50%,rgba(0,0,0,0.9)_100%)]" />
                        </Link>
                        <div className="min-w-0 flex-1 space-y-2 p-3 sm:flex-initial">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h2 className="line-clamp-2 break-words text-lg font-black uppercase sm:truncate">{rapper.name}</h2>
                              <p className="break-words text-xs text-white/55 sm:text-[11px] sm:text-white/45">{rapper.region}</p>
                            </div>
                            <span className="font-mono text-lg font-black text-lime-200">
                              {formatScore(calculateOverallScore(rapper.averageRatings))}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {rapper.tags.slice(0, 3).map((tag) => (
                              <span
                                key={tag}
                                className="max-w-full break-words rounded-md border border-white/10 px-2 py-1 text-[11px] font-black uppercase text-white/65 sm:text-[10px]"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            disabled={removingId === rapper.id}
                            className="h-11 w-full border-white/15 bg-black/30 text-xs text-white hover:bg-red-500 hover:text-white sm:h-8 sm:text-[11px]"
                            onClick={() => removeFavoriteWithMotion(rapper.id)}
                          >
                            <HeartOff className="size-4" />
                            Remove favorite
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </section>
            )}
          </div>

          <aside className="xl:sticky xl:top-5">
            <EditableRatingsList
              ratingsPage={activeRatingsPage}
              isLoading={ratingsLoading}
              errorMessage={ratingsError}
              onPageChange={(page) => {
                void loadRatingsPage(page);
              }}
              onChangeRating={submitRating}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
