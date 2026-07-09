"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RapperAvatar } from "@/components/rapper/RapperAvatar";
import { RatingDialog } from "@/components/ratings/RatingDialog";
import { Button } from "@/components/ui/button";
import type { RatingSubmission, ViewerRatingListResponse } from "@/features/ratings/rating.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";
import { cn } from "@/lib/utils";

function formatUpdatedAt(updatedAt: string) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
  }).format(new Date(updatedAt));
}

export function EditableRatingsList({
  ratingsPage,
  onPageChange,
  onChangeRating,
  viewerDisplayName,
  isLoading = false,
  errorMessage,
}: {
  ratingsPage: ViewerRatingListResponse;
  onPageChange: (page: number) => void;
  onChangeRating: (rapperId: string, submission: RatingSubmission) => Promise<void>;
  viewerDisplayName: string;
  isLoading?: boolean;
  errorMessage?: string | null;
}) {
  const hasItems = ratingsPage.items.length > 0;
  const isFirstPage = ratingsPage.page <= 1;
  const isLastPage = ratingsPage.page >= ratingsPage.totalPages;

  return (
    <section className="flex max-h-[36rem] min-h-[28rem] flex-col overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] lg:h-[calc(100vh-10.5rem)] lg:max-h-[calc(100vh-10.5rem)]">
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-lime-200">
              rating records
            </p>
            <h2 className="mt-1 text-xl font-black uppercase">My Ratings</h2>
          </div>
          <div className="text-right">
            <p className="font-mono text-2xl font-black text-lime-200">{ratingsPage.total}</p>
            <p className="text-[11px] font-black uppercase text-white/45">
              {ratingsPage.page} / {ratingsPage.totalPages}
            </p>
          </div>
        </div>
        {errorMessage ? (
          <p className="mt-3 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <div
        className={cn(
          "min-h-0 flex-1 overflow-hidden px-4 py-4",
          isLoading ? "opacity-70 transition-opacity" : "",
        )}
      >
        {!hasItems ? (
          <div className="rounded-lg border border-white/10 bg-black/30 p-4">
            <p className="text-sm font-bold text-white/60">No ratings yet.</p>
            <Button asChild className="mt-4 bg-lime-200 text-black hover:bg-lime-100">
              <Link href="/">Start rating</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-2">
            {ratingsPage.items.map(({ rating, rapper }) => (
              <article
                key={rating.rapperId}
                className="grid gap-3 rounded-lg border border-white/10 bg-black/35 p-3"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <RapperAvatar rapper={rapper} grayscale />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-black uppercase text-white">
                          {rapper.name}
                        </h3>
                        <p className="truncate text-[11px] uppercase tracking-[0.14em] text-white/40">
                          {rapper.region}
                        </p>
                      </div>
                      <span className="font-mono text-base font-black text-lime-200">
                        {formatScore(calculateOverallScore(rating.ratings))}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-[11px] text-white/45">
                        Updated {formatUpdatedAt(rating.updatedAt)}
                      </p>
                      <RatingDialog
                        rapper={rapper}
                        value={rating.ratings}
                        fondness={rating.fondness}
                        viewerDisplayName={viewerDisplayName}
                        triggerLabel="Edit"
                        triggerClassName="h-8 px-3 text-[11px]"
                        onSubmit={(submission) => onChangeRating(rapper.id, submission)}
                      />
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isFirstPage}
            className="border-white/15 bg-black/30 text-white hover:bg-white/10 hover:text-white disabled:opacity-40"
            onClick={() => onPageChange(ratingsPage.page - 1)}
          >
            <ChevronLeft className="size-4" />
            Previous
          </Button>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/40">
            {hasItems ? `${ratingsPage.items.length} in view` : "Empty page"}
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || isLastPage}
            className="border-white/15 bg-black/30 text-white hover:bg-white/10 hover:text-white disabled:opacity-40"
            onClick={() => onPageChange(ratingsPage.page + 1)}
          >
            Next
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
