"use client";

import dynamic from "next/dynamic";

function RadarChartSkeleton() {
  return (
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-white/10 bg-black/70 p-3">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="h-5 w-32 animate-pulse rounded bg-white/10" />
          <div className="h-4 w-48 animate-pulse rounded bg-white/10" />
        </div>
        <div className="h-12 w-24 animate-pulse rounded bg-white/10" />
      </div>
      <div className="min-h-[250px] flex-1 animate-pulse rounded-lg bg-white/[0.04]" />
    </section>
  );
}

export const RapperRadarChartLazy = dynamic(
  () => import("./RapperRadarChart").then((module) => ({ default: module.RapperRadarChart })),
  {
    ssr: false,
    loading: () => <RadarChartSkeleton />,
  },
);
