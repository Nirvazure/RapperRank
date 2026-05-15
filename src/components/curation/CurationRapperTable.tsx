"use client";

import { RotateCcw, Trash2, Undo2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { CurationRatingEditor } from "@/components/curation/CurationRatingEditor";
import { createDefaultRating } from "@/features/curation/curation.utils";
import type { CuratedRapper } from "@/features/curation/curation.types";
import type { RatingDimension } from "@/features/ratings/rating.types";
import { calculateOverallScore } from "@/features/ratings/rating.utils";

export function CurationRapperTable({
  rappers,
  onExclude,
  onRestore,
  onChangeRating,
  onResetRating,
}: {
  rappers: CuratedRapper[];
  onExclude: (rapperId: string) => void;
  onRestore: (rapperId: string) => void;
  onChangeRating: (rapperId: string, ratings: RatingDimension) => void;
  onResetRating: (rapperId: string) => void;
}) {
  return (
    <section className="grid gap-3">
      {rappers.map((rapper) => (
        <article
          key={rapper.id}
          className={`rounded-lg border p-4 text-white ${
            rapper.isExcluded
              ? "border-red-400/30 bg-red-950/20 opacity-70"
              : "border-white/10 bg-white/[0.06]"
          }`}
        >
          <div className="grid gap-4 xl:grid-cols-[88px_minmax(220px,1fr)_minmax(360px,1.4fr)_auto] xl:items-start">
            <Image
              src={rapper.avatarUrl}
              alt={rapper.name}
              width={88}
              height={88}
              unoptimized
              className="size-22 rounded-md object-cover grayscale"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black uppercase leading-none">
                  {rapper.name}
                </h2>
                {rapper.isExcluded ? (
                  <span className="rounded-md bg-red-400 px-2 py-1 text-[10px] font-black uppercase text-black">
                    deleted
                  </span>
                ) : null}
                {rapper.hasRatingOverride ? (
                  <span className="rounded-md bg-lime-200 px-2 py-1 text-[10px] font-black uppercase text-black">
                    rated
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm font-bold text-white/45">
                {[rapper.alias, rapper.chineseName, rapper.region].filter(Boolean).join(" / ")}
              </p>
              <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/55">
                {rapper.shortReview}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {rapper.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-white/10 px-2 py-1 text-xs font-black uppercase text-white/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <CurationRatingEditor
              value={rapper.averageRatings}
              onChange={(ratings) => onChangeRating(rapper.id, ratings)}
            />
            <div className="flex flex-wrap gap-2 xl:flex-col">
              <div className="rounded-md border border-white/10 bg-black/35 px-3 py-2 text-right">
                <p className="font-mono text-2xl font-black text-lime-200">
                  {calculateOverallScore(rapper.averageRatings).toFixed(1)}
                </p>
                <p className="text-[10px] font-black uppercase text-white/40">score</p>
              </div>
              {rapper.isExcluded ? (
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/15 bg-black/30 text-white hover:bg-white/10 hover:text-white"
                  onClick={() => onRestore(rapper.id)}
                >
                  <Undo2 className="size-4" />
                  Restore
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/15 bg-black/30 text-white hover:bg-red-500 hover:text-white"
                  onClick={() => onExclude(rapper.id)}
                >
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-black/30 text-white hover:bg-lime-200 hover:text-black"
                onClick={() =>
                  rapper.hasRatingOverride
                    ? onResetRating(rapper.id)
                    : onChangeRating(rapper.id, createDefaultRating())
                }
              >
                <RotateCcw className="size-4" />
                Reset
              </Button>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
