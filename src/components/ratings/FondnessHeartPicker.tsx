"use client";

import { Heart } from "lucide-react";
import { MAX_FONDNESS } from "@/lib/constants";

export function FondnessHeartPicker({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (next: number | null) => void;
}) {
  function handleSelect(score: number) {
    if (value === score) {
      onChange(score === 1 ? null : score - 1);
      return;
    }

    onChange(score);
  }

  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      {Array.from({ length: MAX_FONDNESS }, (_, index) => {
        const score = index + 1;
        const active = value != null && score <= value;

        return (
          <button
            key={score}
            type="button"
            aria-label={`喜爱度 ${score} 分`}
            className="flex size-11 shrink-0 items-center justify-center rounded-md transition hover:scale-110 focus-visible:outline-2 focus-visible:outline-lime-200 sm:size-9"
            onClick={() => handleSelect(score)}
          >
            <Heart
              className={`size-7 ${
                active ? "fill-red-500 text-red-500" : "text-white/30"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
