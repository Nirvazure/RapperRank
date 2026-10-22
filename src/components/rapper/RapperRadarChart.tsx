"use client";

import ReactECharts from "echarts-for-react";
import type { ReactNode } from "react";
import type { Rapper } from "@/features/rappers/rapper.types";
import {
  calculateOverallScore,
  formatScore,
  getPhRating,
  normalizePhOrientation,
} from "@/features/ratings/rating.utils";
import {
  PH_ORIENTATION_DESCRIPTIONS,
  PH_ORIENTATION_LABELS,
  RATING_KEYS,
  RATING_LABELS,
} from "@/lib/constants";

export function RapperRadarChart({
  rapper,
  actionSlot,
}: {
  rapper: Rapper;
  actionSlot?: ReactNode;
}) {
  const phValue = getPhRating(rapper.averageRatings);
  const orientation = normalizePhOrientation(phValue);
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
      radius: "66%",
      center: ["50%", "52%"],
      splitNumber: 5,
      axisNameGap: 16,
      indicator: RATING_KEYS.map((key) => ({
        name: RATING_LABELS[key],
        max: 5,
      })),
      axisName: {
        color: "rgba(255,255,255,0.78)",
        fontSize: 18,
        lineHeight: 26,
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
            name: "network average",
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
    <section className="flex h-full min-h-0 flex-col rounded-lg border border-white/10 bg-black/70 p-3">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3 sm:mb-2">
        <div className="min-w-0 flex-1 basis-full sm:basis-[12rem]">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <span className="w-fit rounded-md border border-lime-200/20 bg-lime-200/10 px-3 py-1.5 text-sm font-black tracking-[0.12em] text-lime-200">
              {PH_ORIENTATION_LABELS[orientation]}
            </span>
            <span className="line-clamp-2 text-sm font-bold leading-snug text-white/70">
              {PH_ORIENTATION_DESCRIPTIONS[orientation]}
            </span>
          </div>
        </div>
        <div className="flex w-full max-w-full shrink-0 flex-wrap items-center justify-between gap-2 sm:w-auto sm:items-start sm:justify-end">
          <div className="text-left sm:text-right">
            <div className="flex items-end justify-start gap-1 sm:justify-end">
              <span className="font-mono text-2xl font-black leading-none text-lime-200 sm:text-3xl md:text-3xl xl:text-4xl">
                {formatScore(rapper.overallScore ?? calculateOverallScore(rapper.averageRatings))}
              </span>
              <span className="pb-1 font-mono text-xs font-black text-white/45">
                /5.0
              </span>
            </div>
            <p className="mt-1.5 text-xs text-white/55">
              {rapper.ratingCount > 0 ? `已有 ${rapper.ratingCount.toLocaleString("zh-CN")} 人评分` : "暂无评分"}
            </p>
          </div>
          {actionSlot}
        </div>
      </div>
      <div className="relative min-h-[300px] flex-1 xl:min-h-[240px]">
        <ReactECharts
          key={rapper.id}
          option={option}
          notMerge
          lazyUpdate
          style={{ position: "absolute", inset: 0, height: "100%", width: "100%" }}
        />
      </div>
    </section>
  );
}
