"use client";

import Image from "next/image";
import { Check, Shuffle, SkipForward, Trash2, Undo2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CurationRatingEditor } from "@/components/curation/CurationRatingEditor";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { RatingDimension } from "@/features/ratings/rating.types";
import { calculateOverallScore } from "@/features/ratings/rating.utils";

export function CurationTaskCard({
  rapper,
  initialRating,
  status,
  remainingCount,
  onSaveNext,
  onDeleteNext,
  onSkip,
  onRandom,
  onUndoLast,
  canUndoLast,
}: {
  rapper: Rapper | undefined;
  initialRating: RatingDimension;
  status: string;
  remainingCount: number;
  onSaveNext: (rating: RatingDimension) => void;
  onDeleteNext: () => void;
  onSkip: () => void;
  onRandom: () => void;
  onUndoLast: () => void;
  canUndoLast: boolean;
}) {
  const [draftRating, setDraftRating] = useState<RatingDimension>(initialRating);

  if (!rapper) {
    return (
      <section className="rounded-lg border border-lime-200/25 bg-lime-200/10 p-8 text-white">
        <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-lime-200">
          all done
        </p>
        <h2 className="mt-3 text-4xl font-black uppercase">No unrated rappers</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">
          当前没有未评分且未删除的 rapper。你可以继续在下方辅助列表中恢复、删除或调整评分。
        </p>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-lg border border-white/10 bg-white/[0.06] text-white">
      <div className="grid gap-0 xl:grid-cols-[minmax(360px,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative min-h-[460px] bg-black">
          <Image
            src={rapper.mediaUrl}
            alt={rapper.name}
            fill
            priority
            unoptimized
            className="object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-black/40" />
          <div className="absolute left-5 top-5 rounded-md bg-lime-200 px-3 py-1 font-mono text-xs font-black uppercase text-black">
            {remainingCount} unrated left
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <p className="font-mono text-xs font-black uppercase tracking-[0.28em] text-lime-200">
              random unrated
            </p>
            <h2 className="mt-2 max-w-[12ch] text-5xl font-black uppercase leading-none">
              {rapper.name}
            </h2>
            <p className="mt-3 text-sm font-bold text-white/65">
              {[rapper.alias, rapper.chineseName, rapper.region].filter(Boolean).join(" / ")}
            </p>
          </div>
        </div>
        <div className="grid gap-5 p-5">
          <div>
            <p className="text-sm leading-7 text-white/65">{rapper.bio}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {rapper.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/10 px-2.5 py-1 text-xs font-black uppercase text-white/60"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-3">
              <p className="text-xs font-black uppercase text-white/40">works</p>
              <p className="mt-1 text-sm font-bold text-white/70">
                {rapper.representativeWorks.join(" / ")}
              </p>
            </div>
          </div>

          <CurationRatingEditor value={draftRating} onChange={setDraftRating} />

          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="bg-lime-200 text-black hover:bg-lime-100"
              onClick={() => onSaveNext(draftRating)}
            >
              <Check className="size-4" />
              Save & Next
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-white/15 bg-black/30 text-white hover:bg-red-500 hover:text-white"
              onClick={onDeleteNext}
            >
              <Trash2 className="size-4" />
              Delete & Next
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-white/15 bg-black/30 text-white hover:bg-white/10 hover:text-white"
              onClick={onSkip}
            >
              <SkipForward className="size-4" />
              Skip
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-white/15 bg-black/30 text-white hover:bg-white/10 hover:text-white"
              onClick={onRandom}
            >
              <Shuffle className="size-4" />
              Random Unrated
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={!canUndoLast}
              className="border-white/15 bg-black/30 text-white hover:bg-white/10 hover:text-white"
              onClick={onUndoLast}
            >
              <Undo2 className="size-4" />
              Undo Last
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-3 py-2">
            <span className="text-xs font-bold text-white/45">{status}</span>
            <span className="font-mono text-xl font-black text-lime-200">
              {calculateOverallScore(draftRating).toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
