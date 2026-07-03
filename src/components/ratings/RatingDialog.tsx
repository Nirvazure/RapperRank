"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FondnessHeartPicker } from "@/components/ratings/FondnessHeartPicker";
import { RapperRatingPanel } from "@/components/rapper/RapperRatingPanel";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { RatingDimension, RatingSubmission } from "@/features/ratings/rating.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

const DEFAULT_RATINGS: RatingDimension = {
  flow: 3,
  lyrics: 3,
  voice: 3,
  technique: 3,
  melody: 3,
  stage: 3,
  ph: 0,
};

export function RatingDialog({
  rapper,
  value,
  fondness,
  onSubmit,
  triggerLabel = "我要评分",
  viewerDisplayName,
}: {
  rapper: Rapper;
  value?: RatingDimension;
  fondness?: number | null;
  onSubmit: (submission: RatingSubmission) => Promise<void>;
  triggerLabel?: string;
  viewerDisplayName: string;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<RatingDimension>(value ?? DEFAULT_RATINGS);
  const [draftFondness, setDraftFondness] = useState<number | null>(fondness ?? null);
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element || !open) {
      return;
    }

    const animation = gsap.fromTo(
      element,
      { opacity: 0, y: 24, scale: 0.98 },
      { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" },
    );

    return () => {
      animation.kill();
    };
  }, [open]);

  function handleOpenChange(nextOpen: boolean) {
    if (nextOpen) {
      setDraft(value ?? DEFAULT_RATINGS);
      setDraftFondness(fondness ?? null);
      setError(null);
    }

    setOpen(nextOpen);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        ratings: draft,
        fondness: draftFondness,
      });
      setOpen(false);
    } catch {
      setError("评分保存失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-11 bg-lime-200 px-4 text-sm font-black uppercase text-black hover:bg-lime-100"
        >
          <Star className="size-4 fill-current" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-white/15 bg-zinc-950 text-white sm:max-w-3xl">
        <div ref={contentRef}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase">
              Rate {rapper.name}
            </DialogTitle>
            <DialogDescription className="text-white/55">
              当前综合分 {formatScore(calculateOverallScore(rapper.averageRatings))} / 5.0。
              当前会话用户：{viewerDisplayName}。
            </DialogDescription>
          </DialogHeader>
          <section className="mt-5 rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-3">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-red-300">
                optional
              </p>
              <h3 className="text-xl font-black uppercase">喜爱度</h3>
              <p className="mt-1 text-sm text-white/45">
                主观偏好，不参与综合分计算；不选则不计入社区喜爱度。
              </p>
            </div>
            <FondnessHeartPicker value={draftFondness} onChange={setDraftFondness} />
          </section>
          <div className="mt-4">
            <RapperRatingPanel value={draft} onChange={setDraft} />
          </div>
          {error ? (
            <p className="mt-4 rounded-md border border-red-400/30 bg-red-500/10 px-3 py-2 text-xs font-bold text-red-100">
              {error}
            </p>
          ) : null}
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              disabled={submitting}
              className="bg-lime-200 text-black hover:bg-lime-100"
              onClick={handleSubmit}
            >
              {submitting ? "保存中..." : "保存评分"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
