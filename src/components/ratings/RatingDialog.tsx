"use client";

import { useEffect, useRef } from "react";
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
import { RapperRatingPanel } from "@/components/rapper/RapperRatingPanel";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { RatingDimension } from "@/features/ratings/rating.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

export function RatingDialog({
  rapper,
  value,
  onChange,
}: {
  rapper: Rapper;
  value?: RatingDimension;
  onChange: (ratings: RatingDimension) => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = contentRef.current;
    if (!element) {
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
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          className="h-11 bg-lime-200 px-4 text-sm font-black uppercase text-black hover:bg-lime-100"
        >
          <Star className="size-4 fill-current" />
          我要评分
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto border-white/15 bg-zinc-950 text-white sm:max-w-3xl">
        <div ref={contentRef}>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black uppercase">
              Rate {rapper.name}
            </DialogTitle>
            <DialogDescription className="text-white/55">
              当前全网平均 {formatScore(calculateOverallScore(rapper.averageRatings))} / 5.0。
              你的评分会保存到本地身份，后续可迁移到 Supabase。
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5">
            <RapperRatingPanel value={value} onChange={onChange} />
          </div>
          <p className="mt-4 rounded-md border border-lime-200/20 bg-lime-200/10 px-3 py-2 text-xs font-bold text-lime-100">
            已保存到本地身份。排行榜、选择器和雷达图会同步显示模拟后的平均分。
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
