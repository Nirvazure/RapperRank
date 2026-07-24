"use client";

import { useState } from "react";
import { Info, Star } from "lucide-react";
import type { PhOrientation, RadarRatingKey, RatingDimension } from "@/features/ratings/rating.types";
import { getPhRating, inferPhOrientationFromRatings, normalizePhOrientation } from "@/features/ratings/rating.utils";
import {
  PH_ORIENTATION_DESCRIPTIONS,
  PH_ORIENTATION_LABELS,
  PH_ORIENTATION_VALUES,
  RATING_DESCRIPTIONS,
  RATING_KEYS,
  RATING_LABELS,
  RATING_LEVEL_DESCRIPTIONS,
} from "@/lib/constants";

export function RapperRatingPanel({
  value,
  onChange,
}: {
  value: RatingDimension;
  onChange: (ratings: RatingDimension) => void;
}) {
  const [activeInfoKey, setActiveInfoKey] = useState<RadarRatingKey | null>(null);
  const [hasManualOrientation, setHasManualOrientation] = useState(false);
  const phValue = getPhRating(value);
  const orientation = normalizePhOrientation(phValue);

  function updateRating(key: RadarRatingKey, score: number) {
    const next = { ...value, [key]: score };
    onChange({
      ...next,
      ph: hasManualOrientation ? value.ph : inferPhOrientationFromRatings(next),
    });
  }

  function updatePhRating(score: PhOrientation) {
    setHasManualOrientation(true);
    onChange({ ...value, ph: score });
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5 text-white">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-red-300">
            YOUR SCORE
          </p>
          <h2 className="text-2xl font-black">六维评分</h2>
        </div>
        <span className="font-mono text-xs text-white/45">匿名会话</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {RATING_KEYS.map((key) => (
          <div key={key} className="space-y-2 border-t border-white/10 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="relative flex items-center gap-2">
                  <h3 className="text-sm font-black">{RATING_LABELS[key]}</h3>
                  <button
                    type="button"
                    aria-label={`查看 ${RATING_LABELS[key]} 评分说明`}
                    onClick={() => setActiveInfoKey(activeInfoKey === key ? null : key)}
                    className="flex size-5 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/55 transition hover:border-lime-200 hover:text-lime-200"
                  >
                    <Info className="size-3" />
                  </button>
                  {activeInfoKey === key ? (
                    <div className="absolute left-0 top-7 z-20 w-72 rounded-md border border-lime-200/20 bg-zinc-950 p-3 shadow-xl shadow-black/40">
                      <div className="mb-2 text-xs font-black text-lime-200">
                        {RATING_LABELS[key]} 评分档位
                      </div>
                      <div className="grid gap-2">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div key={level} className="grid grid-cols-[24px_minmax(0,1fr)] gap-2">
                            <span className="font-mono text-xs font-black text-white">{level}</span>
                            <span className="text-xs leading-5 text-white/65">
                              {RATING_LEVEL_DESCRIPTIONS[key][level]}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <p className="mt-1 text-xs leading-5 text-white/45">{RATING_DESCRIPTIONS[key]}</p>
              </div>
              <span className="font-mono text-xl font-black text-lime-200">
                {value[key].toFixed(1)}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <span key={score} className="group relative">
                  <button
                    type="button"
                    aria-label={`${RATING_LABELS[key]} ${score} 分`}
                    onClick={() => updateRating(key, score)}
                    className="flex size-8 items-center justify-center rounded-md border border-white/10 bg-black/40 text-white transition hover:border-lime-200 hover:text-lime-200 focus-visible:border-lime-200 focus-visible:text-lime-200 focus-visible:outline-none"
                  >
                    <Star
                      className={
                        score <= value[key]
                          ? "size-4 fill-lime-200 text-lime-200"
                          : "size-4 text-white/35"
                      }
                    />
                  </button>
                  <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-md border border-white/10 bg-zinc-950 px-3 py-2 text-xs leading-5 text-white/75 opacity-0 shadow-xl shadow-black/40 transition group-focus-within:opacity-100 group-hover:opacity-100">
                    {RATING_LEVEL_DESCRIPTIONS[key][score]}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-black">Rapper 定位</h3>
            <p className="mt-1 text-xs leading-5 text-white/45">
              根据六维评分自动推荐，也可以手动调整。
            </p>
          </div>
          <span className="text-sm font-black text-red-300">
            {hasManualOrientation ? "已手动调整" : "自动推荐"}
          </span>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {PH_ORIENTATION_VALUES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => updatePhRating(option)}
              className={
                orientation === option
                  ? "rounded-md border border-lime-200 bg-lime-200 px-3 py-3 text-left text-black transition"
                  : "rounded-md border border-white/10 bg-black/35 px-3 py-3 text-left text-white transition hover:border-white/35"
              }
            >
              <span className="block text-sm font-black">{PH_ORIENTATION_LABELS[option]}</span>
              <span
                className={
                  orientation === option
                    ? "mt-1 block text-xs leading-5 text-black/70"
                    : "mt-1 block text-xs leading-5 text-white/45"
                }
              >
                {PH_ORIENTATION_DESCRIPTIONS[option]}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
