"use client";

import { useId, useState, type ReactNode } from "react";
import { RapperProfilePanel } from "@/components/rapper/RapperProfilePanel";
import { RapperRadarChartLazy } from "@/components/rapper/RapperRadarChartLazy";
import type { Rapper } from "@/features/rappers/rapper.types";
import { cn } from "@/lib/utils";

type DetailTab = "radar" | "hits";

const TABS: { id: DetailTab; label: string }[] = [
  { id: "radar", label: "能力画像" },
  { id: "hits", label: "档案与作品" },
];

export function RapperMobileDetailTabs({
  rapper,
  actionSlot,
}: {
  rapper: Rapper;
  actionSlot?: ReactNode;
}) {
  return <MobileDetailTabs key={rapper.id} rapper={rapper} actionSlot={actionSlot} />;
}

function MobileDetailTabs({ rapper, actionSlot }: { rapper: Rapper; actionSlot?: ReactNode }) {
  const baseId = useId();
  const [tab, setTab] = useState<DetailTab>("radar");

  return (
    <div className="flex flex-col gap-3">
      <div
        role="tablist"
        aria-label="详情分区"
        className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] p-1"
      >
        {TABS.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-${item.id}-tab`}
              aria-selected={selected}
              aria-controls={`${baseId}-${item.id}-panel`}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "inline-flex h-8 flex-1 items-center justify-center rounded-md px-2.5 text-[11px] font-black uppercase tracking-[0.08em] transition",
                selected
                  ? "bg-lime-200 text-black"
                  : "text-white/65 hover:bg-white/10 hover:text-white",
              )}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-${tab}-panel`}
        aria-labelledby={`${baseId}-${tab}-tab`}
        className="min-h-0"
      >
        {tab === "radar" ? (
          <RapperRadarChartLazy rapper={rapper} actionSlot={actionSlot} />
        ) : (
          <RapperProfilePanel rapper={rapper} />
        )}
      </div>
    </div>
  );
}
