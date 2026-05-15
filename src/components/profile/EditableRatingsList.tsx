"use client";

import Link from "next/link";
import { RatingDialog } from "@/components/ratings/RatingDialog";
import { Button } from "@/components/ui/button";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { RatingDimension, UserRating } from "@/features/ratings/rating.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

export function EditableRatingsList({
  rappers,
  ratings,
  onChangeRating,
}: {
  rappers: Rapper[];
  ratings: UserRating[];
  onChangeRating: (rapperId: string, ratings: RatingDimension) => void;
}) {
  const records = ratings
    .map((rating) => {
      const rapper = rappers.find((item) => item.id === rating.rapperId);
      return rapper ? { rating, rapper } : undefined;
    })
    .filter((record): record is { rating: UserRating; rapper: Rapper } =>
      Boolean(record),
    );

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-lime-200">
            rating records
          </p>
          <h2 className="mt-1 text-xl font-black uppercase">我的评分记录</h2>
        </div>
      </div>
      {records.length === 0 ? (
        <div className="rounded-lg border border-white/10 bg-black/30 p-4">
          <p className="text-sm font-bold text-white/60">还没有本地评分记录。</p>
          <Button asChild className="mt-4 bg-lime-200 text-black hover:bg-lime-100">
            <Link href="/">去评分</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-2">
          {records.map(({ rating, rapper }) => (
            <article
              key={rating.rapperId}
              className="grid gap-2 rounded-lg border border-white/10 bg-black/35 p-2 sm:grid-cols-[1fr_auto] sm:items-center"
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <img
                  src={rapper.avatarUrl}
                  alt={rapper.name}
                  className="size-10 rounded-md object-cover grayscale"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-black uppercase text-white">
                      {rapper.name}
                    </h3>
                    <span className="font-mono text-base font-black text-lime-200">
                      {formatScore(calculateOverallScore(rating.ratings))}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-white/45">
                    更新于 {new Date(rating.updatedAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
              </div>
              <RatingDialog
                rapper={rapper}
                value={rating.ratings}
                triggerLabel="修改评分"
                onChange={(nextRatings) => onChangeRating(rapper.id, nextRatings)}
              />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
