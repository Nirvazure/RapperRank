"use client";

import ReactECharts from "echarts-for-react";
import type { ReactNode } from "react";
import type { Rapper } from "@/features/rappers/rapper.types";
import {
  calculateOverallScore,
  formatScore,
  getPhRating,
} from "@/features/ratings/rating.utils";
import { MAX_PH_RATING, MIN_PH_RATING, RATING_KEYS, RATING_LABELS } from "@/lib/constants";

export function RapperRadarChart({
  rapper,
  actionSlot,
}: {
  rapper: Rapper;
  actionSlot?: ReactNode;
}) {
  const phValue = getPhRating(rapper.averageRatings);
  const phPosition = ((phValue - MIN_PH_RATING) / (MAX_PH_RATING - MIN_PH_RATING)) * 100;
  const option = {
    backgroundColor: "transparent",
    color: ["#d9ff00"],
    tooltip: {
      trigger: "item",
      backgroundColor: "#111",
      borderColor: "rgba(255,255,255,0.18)",
      textStyle: { color: "#fff" },
    },
    radar: {
      radius: "68%",
      center: ["50%", "54%"],
      splitNumber: 5,
      indicator: RATING_KEYS.map((key) => ({
        name: RATING_LABELS[key],
        max: 5,
      })),
      axisName: {
        color: "rgba(255,255,255,0.78)",
        fontWeight: 800,
      },
      axisLine: { lineStyle: { color: "rgba(255,255,255,0.18)" } },
      splitLine: { lineStyle: { color: "rgba(255,255,255,0.14)" } },
      splitArea: {
        areaStyle: {
          color: ["rgba(255,255,255,0.02)", "rgba(255,255,255,0.05)"],
        },
      },
    },
    series: [
      {
        name: rapper.name,
        type: "radar",
        data: [
          {
            value: RATING_KEYS.map((key) => rapper.averageRatings[key]),
            name: "全网平均",
            areaStyle: { color: "rgba(217,255,0,0.28)" },
            lineStyle: { width: 3, color: "#d9ff00" },
            symbol: "circle",
            symbolSize: 7,
          },
        ],
      },
    ],
  };

  return (
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-white/10 bg-black/70 p-4">
      <div className="mb-2 flex items-start justify-between gap-4">
        <h2 className="text-xl font-black uppercase text-white">Power Radar</h2>
        <div className="flex shrink-0 items-start gap-3">
          <div className="text-right">
            <div className="font-mono text-5xl font-black leading-none text-lime-200">
              {formatScore(calculateOverallScore(rapper.averageRatings))}
            </div>
            <div className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/55">
              / 5.0 · {rapper.ratingCount.toLocaleString()} ratings · 1-5
            </div>
          </div>
          {actionSlot}
        </div>
      </div>
      <div className="grid min-h-[280px] flex-1 grid-cols-[74px_minmax(0,1fr)] gap-2">
        <div className="flex min-h-0 flex-col items-center py-2">
          <span className="text-[9px] font-black uppercase tracking-[0.08em] text-lime-200">
            Commercial
          </span>
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-lime-200">
            +3
          </span>
          <div className="relative my-2 w-2 flex-1 rounded-full bg-gradient-to-t from-red-400 via-white/25 to-lime-200">
            <span
              className="absolute left-1/2 size-4 -translate-x-1/2 translate-y-1/2 rounded-full border-2 border-black bg-white shadow-lg shadow-black/40"
              style={{ bottom: `${phPosition}%` }}
            />
          </div>
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-red-300">
            -3
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.08em] text-red-300">
            Underground
          </span>
          <div className="mt-2 text-center">
            <div className="font-mono text-sm font-black text-red-300">
              {phValue.toFixed(1)}
            </div>
            <div className="mt-1 text-[9px] font-black uppercase tracking-[0.14em] text-white/45">
              PH
            </div>
          </div>
        </div>
        <div className="min-h-0">
          <ReactECharts
            key={rapper.id}
            option={option}
            notMerge
            lazyUpdate
            style={{ height: "100%", width: "100%" }}
          />
        </div>
      </div>
    </section>
  );
}
