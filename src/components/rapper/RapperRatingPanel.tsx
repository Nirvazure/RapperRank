"use client";

import { Star } from "lucide-react";
import type { RatingDimension, RatingKey } from "@/features/ratings/rating.types";
import { RATING_DESCRIPTIONS, RATING_KEYS, RATING_LABELS } from "@/lib/constants";

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
    } satisfies RatingDimension);

  function updateRating(key: RatingKey, score: number) {
    onChange({ ...current, [key]: score });
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
    </section>
  );
}
