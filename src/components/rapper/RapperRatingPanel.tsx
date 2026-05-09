"use client";

import { Star } from "lucide-react";
import type { RadarRatingKey, RatingDimension } from "@/features/ratings/rating.types";
import { getPhRating } from "@/features/ratings/rating.utils";
import {
  MAX_PH_RATING,
  MIN_PH_RATING,
  RATING_DESCRIPTIONS,
  RATING_KEYS,
  RATING_LABELS,
} from "@/lib/constants";

export function RapperRatingPanel({
  value,
  onChange,
}: {
  value?: RatingDimension;
  onChange: (ratings: RatingDimension) => void;
}) {
  const current =
    value ??
    ({
      flow: 3,
      lyrics: 3,
      voice: 3,
      technique: 3,
      melody: 3,
      stage: 3,
      ph: 0,
    } satisfies RatingDimension);

  const phValue = getPhRating(current);
  const phPosition = ((phValue - MIN_PH_RATING) / (MAX_PH_RATING - MIN_PH_RATING)) * 100;

  function updateRating(key: RadarRatingKey, score: number) {
    onChange({ ...current, [key]: score });
  }

  function updatePhRating(score: number) {
    onChange({ ...current, ph: score });
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-5 text-white">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs font-bold uppercase tracking-[0.24em] text-red-300">
            your score
          </p>
          <h2 className="text-2xl font-black uppercase">六维打分</h2>
        </div>
        <span className="font-mono text-xs text-white/45">本地模拟用户</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {RATING_KEYS.map((key) => (
          <div key={key} className="space-y-2 border-t border-white/10 pt-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-black">{RATING_LABELS[key]}</h3>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  {RATING_DESCRIPTIONS[key]}
                </p>
              </div>
              <span className="font-mono text-xl font-black text-lime-200">
                {current[key].toFixed(1)}
              </span>
            </div>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((score) => (
                <button
                  key={score}
                  type="button"
                  aria-label={`${RATING_LABELS[key]} ${score}分`}
                  onClick={() => updateRating(key, score)}
                  className="flex size-8 items-center justify-center rounded-md border border-white/10 bg-black/40 text-white transition hover:border-lime-200 hover:text-lime-200"
                >
                  <Star
                    className={
                      score <= current[key]
                        ? "size-4 fill-lime-200 text-lime-200"
                        : "size-4 text-white/35"
                    }
                  />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 border-t border-white/10 pt-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-black">PH值坐标</h3>
            <p className="mt-1 text-xs leading-5 text-white/45">
              左侧偏地下，右侧偏商业，独立于六维雷达图和总分。
            </p>
          </div>
          <span className="font-mono text-xl font-black text-red-300">
            {phValue.toFixed(1)}
          </span>
        </div>
        <div className="mt-4">
          <div className="relative h-3 rounded-full bg-gradient-to-r from-red-400 via-white/35 to-lime-200">
            <span
              className="absolute top-1/2 size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-black bg-white shadow-lg shadow-black/40"
              style={{ left: `${phPosition}%` }}
            />
          </div>
          <input
            type="range"
            min={MIN_PH_RATING}
            max={MAX_PH_RATING}
            step={0.5}
            value={phValue}
            aria-label="PH值，左侧地下，右侧商业"
            onChange={(event) => updatePhRating(Number(event.target.value))}
            className="mt-3 h-8 w-full cursor-pointer accent-lime-200"
          />
          <div className="mt-1 grid grid-cols-7 text-center font-mono text-[10px] font-black text-white/45">
            {[-3, -2, -1, 0, 1, 2, 3].map((value) => (
              <span key={value}>{value}</span>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-bold text-white/55">
            <span>Underground</span>
            <span>Commercial</span>
          </div>
        </div>
      </div>
    </section>
  );
}
