"use client";

import ReactECharts from "echarts-for-react";
import type { Rapper } from "@/features/rappers/rapper.types";
import { RATING_KEYS, RATING_LABELS } from "@/lib/constants";

export function RapperRadarChart({ rapper }: { rapper: Rapper }) {
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
    <section className="rounded-lg border border-white/10 bg-black/70 p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-xl font-black uppercase text-white">Power Radar</h2>
        <span className="font-mono text-xs font-bold text-lime-200">1-5</span>
      </div>
      <ReactECharts
        key={rapper.id}
        option={option}
        notMerge
        lazyUpdate
        style={{ height: 320, width: "100%" }}
      />
    </section>
  );
}
