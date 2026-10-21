"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FondnessHeartPicker } from "@/components/ratings/FondnessHeartPicker";
import { RapperRatingPanel } from "@/components/rapper/RapperRatingPanel";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { RatingDimension, RatingSubmission } from "@/features/ratings/rating.types";
import { cn } from "@/lib/utils";

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
  triggerLabel = "评分",
  triggerClassName,
}: {
  rapper: Pick<Rapper, "id" | "name">;
  value?: RatingDimension;
  fondness?: number | null;
  onSubmit: (submission: RatingSubmission) => Promise<void>;
  triggerLabel?: string;
  triggerClassName?: string;
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
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
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
      setError("保存失败，请重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className={cn(
            "h-11 bg-lime-200 px-4 text-sm font-black uppercase text-black hover:bg-lime-100",
            triggerClassName,
          )}
        >
          <Star className="size-4 fill-current" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="bottom-0 left-0 top-auto flex max-h-[calc(100dvh-env(safe-area-inset-top,0px)-1rem)] max-w-none translate-x-0 translate-y-0 overflow-hidden rounded-b-none rounded-t-2xl border-white/15 bg-zinc-950 p-0 text-white sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[88dvh] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-xl [&>[data-slot=dialog-close]]:size-11">
        <div ref={contentRef} className="flex min-h-0 w-full flex-col">
          <div className="shrink-0 border-b border-white/10 px-4 py-4 pr-14 sm:px-5">
            <DialogTitle className="break-words text-lg font-black leading-6">评分 {rapper.name}</DialogTitle>
          </div>
          <div className="min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-5">
          <section className="rounded-lg border border-white/10 bg-white/[0.04] p-4 sm:p-5">
            <div className="mb-3">
              <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-red-300">
                OPTIONAL
              </p>
              <h3 className="text-xl font-black">喜爱度</h3>
              <p className="mt-1 text-sm text-white/45">
                这是个人偏好信号，不影响综合评分。
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
          </div>
          <div className="flex shrink-0 justify-end border-t border-white/10 bg-zinc-950 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:px-5">
            <Button
              type="button"
              disabled={submitting}
              className="h-12 w-full bg-lime-200 text-base font-black text-black hover:bg-lime-100 sm:h-10 sm:w-auto sm:text-sm"
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
