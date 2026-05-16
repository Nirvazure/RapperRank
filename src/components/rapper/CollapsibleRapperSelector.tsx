"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RapperSelector } from "@/components/rapper/RapperSelector";
import {
  RAPPER_IMAGE_PLACEHOLDER_LABEL,
  resolveRapperAvatar,
} from "@/features/rappers/rapper.media";
import type { Rapper } from "@/features/rappers/rapper.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

export function CollapsibleRapperSelector({
  rappers,
  selectedRapper,
  onSelect,
}: {
  rappers: Rapper[];
  selectedRapper: Rapper;
  onSelect: (rapperId: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const avatar = resolveRapperAvatar(selectedRapper);

  function selectAndCollapse(rapperId: string) {
    onSelect(rapperId);
    setExpanded(false);
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          {avatar.src ? (
            <img
              src={avatar.src}
              alt={avatar.alt}
              className="size-11 rounded-md object-cover grayscale"
            />
          ) : (
            <div className="flex size-11 items-center justify-center rounded-md bg-black/35 text-center">
              <span className="px-1 font-mono text-[8px] font-black uppercase leading-tight text-white/45">
                {RAPPER_IMAGE_PLACEHOLDER_LABEL}
              </span>
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-black uppercase text-white">
              {selectedRapper.name}
            </p>
            <p className="font-mono text-xs font-black text-lime-200">
              {formatScore(calculateOverallScore(selectedRapper.averageRatings))} / 5
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          className="border-white/15 bg-black/30 text-white hover:bg-white/10 hover:text-white"
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          切换
        </Button>
      </div>
      {expanded ? (
        <div className="mt-3 border-t border-white/10 pt-3">
          <RapperSelector
            rappers={rappers}
            selectedRapperId={selectedRapper.id}
            onSelect={selectAndCollapse}
          />
        </div>
      ) : null}
    </section>
  );
}
