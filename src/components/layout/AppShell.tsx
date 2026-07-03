"use client";

import { startTransition, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { Shuffle } from "lucide-react";
import { useRapperPlayer } from "@/contexts/RapperPlayerContext";
import { PageHeader } from "@/components/layout/PageHeader";
import { RatingDialog } from "@/components/ratings/RatingDialog";
import { Button } from "@/components/ui/button";
import { RapperMediaPanel } from "@/components/rapper/RapperMediaPanel";
import { RapperProfilePanel } from "@/components/rapper/RapperProfilePanel";
import { RapperRadarChartLazy } from "@/components/rapper/RapperRadarChartLazy";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { UserRating } from "@/features/ratings/rating.types";
import type { ViewerPresentation } from "@/features/user/user.types";

export function AppShell({
  rapper,
  isFavorite,
  myRating,
  viewer,
}: {
  rapper: Rapper;
  isFavorite: boolean;
  myRating: UserRating | null;
  viewer: ViewerPresentation;
}) {
  const shellRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const { playRapperTrack } = useRapperPlayer();
  const [pendingFavorite, setPendingFavorite] = useState(isFavorite);
  const [pendingRating, setPendingRating] = useState<UserRating | null>(myRating);

  useEffect(() => {
    if (!rapper.backgroundAudioUrl) {
      return;
    }

    const track = {
      rapperId: rapper.id,
      title: rapper.name,
      subtitle: rapper.region,
      coverUrl: rapper.avatarUrl ?? rapper.mediaUrl,
      src: rapper.backgroundAudioUrl,
    };

    const startPlayback = () => {
      playRapperTrack(track);
    };

    if (typeof window.requestIdleCallback === "function") {
      const idleId = window.requestIdleCallback(startPlayback, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = window.setTimeout(startPlayback, 1500);
    return () => window.clearTimeout(timeoutId);
  }, [
    playRapperTrack,
    rapper.avatarUrl,
    rapper.backgroundAudioUrl,
    rapper.id,
    rapper.mediaUrl,
    rapper.name,
    rapper.region,
  ]);

  async function toggleFavorite() {
    const method = pendingFavorite ? "DELETE" : "POST";
    setPendingFavorite(!pendingFavorite);

    const response = await fetch(`/api/me/favorites/${rapper.id}`, {
      method,
    });

    if (!response.ok) {
      setPendingFavorite(isFavorite);
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  }

  async function submitRating(ratings: UserRating["ratings"]) {
    const response = await fetch("/api/ratings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rapperId: rapper.id,
        ratings,
      }),
    });

    if (!response.ok) {
      throw new Error("rating request failed");
    }

    setPendingRating({
      userId: myRating?.userId ?? "anonymous",
      rapperId: rapper.id,
      ratings,
      createdAt: myRating?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    startTransition(() => {
      router.refresh();
    });
  }

  async function openRandomRapper() {
    const response = await fetch("/api/rappers");
    if (!response.ok) {
      return;
    }

    const rappers = (await response.json()) as Rapper[];
    const candidates = rappers.filter((item) => item.slug && item.slug !== rapper.slug);
    const pool = candidates.length > 0 ? candidates : [rapper];
    const next = pool[Math.floor(Math.random() * pool.length)];
    if (!next?.slug) {
      return;
    }
    router.push(`/rank/${next.slug}`);
  }

  useLayoutEffect(() => {
    const root = shellRef.current;
    if (!root) {
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(
        root.querySelectorAll(".hero-enter"),
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

    return () => context.revert();
  }, [rapper.id]);

  return (
    <main
      ref={shellRef}
      className="min-h-screen overflow-hidden bg-[#050505] px-4 py-4 text-white sm:px-6 lg:px-8"
    >
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(217,255,0,0.14),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(255,46,91,0.16),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(0,190,255,0.12),transparent_32%)]" />

      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-4">
        <div className="hero-enter">
          <PageHeader
            eyebrow="choose / inspect / rate"
            title="RapperRank"
            description="在详情页查看当前 Rapper 的视觉信息、能力画像和六维评分，在社区页浏览完整排行榜。"
            user={viewer}
          />
        </div>

        <div className="grid items-stretch gap-4 xl:min-h-[calc(100vh-140px)] xl:grid-cols-[minmax(360px,0.88fr)_minmax(520px,1.12fr)]">
          <div className="hero-enter h-full">
            <RapperMediaPanel
              rapper={rapper}
              isFavorite={pendingFavorite}
              onToggleFavorite={toggleFavorite}
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
            <RapperRadarChartLazy
              rapper={rapper}
              actionSlot={
                <RatingDialog
                  rapper={rapper}
                  value={pendingRating?.ratings}
                  triggerLabel="评分"
                  viewerDisplayName={viewer.displayName}
                  onSubmit={submitRating}
                />
              }
            />
            <RapperProfilePanel rapper={rapper} />
          </div>
        </div>
      </div>
    </main>
  );
}
