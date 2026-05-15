"use client";

import {
  PH_ORIENTATION_LABELS,
  PH_ORIENTATION_VALUES,
  RATING_KEYS,
  RATING_LABELS,
} from "@/lib/constants";
import { IntegerRatingButtons } from "@/components/curation/IntegerRatingButtons";
import type { RatingDimension } from "@/features/ratings/rating.types";
import {
  calculateOverallScore,
  getPhRating,
  normalizePhOrientation,
} from "@/features/ratings/rating.utils";

export function CurationRatingEditor({
  value,
  onChange,
}: {
  value: RatingDimension;
  onChange: (value: RatingDimension) => void;
}) {
  function updateRating(key: (typeof RATING_KEYS)[number], score: number) {
    onChange({ ...value, [key]: score });
  }

  function updatePh(score: number) {
    onChange({ ...value, ph: score });
  }

  return (
    <div className="grid gap-3 rounded-md border border-white/10 bg-black/35 p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase text-white/45">Initial score</span>
        <span className="font-mono text-xl font-black text-lime-200">
          {calculateOverallScore(value).toFixed(1)}
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {RATING_KEYS.map((key) => (
          <IntegerRatingButtons
            key={key}
            label={RATING_LABELS[key]}
            value={value[key]}
            values={[1, 2, 3, 4, 5]}
            onChange={(score) => updateRating(key, score)}
          />
        ))}
        <IntegerRatingButtons
          label="Rapper定位"
          value={normalizePhOrientation(getPhRating(value))}
          values={[...PH_ORIENTATION_VALUES]}
          valueLabels={PH_ORIENTATION_LABELS}
          tone="red"
          onChange={updatePh}
        />
      </div>
    </div>
  );
}
