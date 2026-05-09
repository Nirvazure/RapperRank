"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RapperSelector } from "@/components/rapper/RapperSelector";
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

  function selectAndCollapse(rapperId: string) {
    onSelect(rapperId);
    setExpanded(false);
  }

  return (
    <section className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <img
            src={selectedRapper.avatarUrl}
            alt={selectedRapper.name}
            className="size-11 rounded-md object-cover grayscale"
          />
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
