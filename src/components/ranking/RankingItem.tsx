import type { Rapper } from "@/features/rappers/rapper.types";
import { FondnessStat } from "@/components/ratings/FondnessStat";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

export function RankingItem({
  rapper,
  rank,
  active,
  compact = false,
  onSelect,
}: {
  rapper: Rapper;
  rank: number;
  active: boolean;
  compact?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`ranking-item group grid items-center rounded-lg border text-left transition duration-300 ${
        active
          ? "border-lime-200 bg-lime-200 text-black"
          : "border-white/10 bg-black/40 text-white hover:-translate-y-0.5 hover:border-red-300 hover:bg-white/10"
      } ${
        compact
          ? "grid-cols-[42px_1fr_auto] gap-2 p-2.5"
          : "grid-cols-[64px_1fr_auto] gap-4 p-4"
      }`}
    >
      <span
        className={`font-mono font-black leading-none transition duration-300 group-hover:translate-x-1 ${
          rank === 1 && !active ? "text-lime-200" : ""
        } ${compact ? "text-2xl" : "text-4xl"}`}
      >
        {rank.toString().padStart(2, "0")}
      </span>
      <div className="min-w-0">
        <h3 className="truncate text-base font-black uppercase">{rapper.name}</h3>
        <p className={active ? "text-xs text-black/60" : "text-xs text-white/45"}>
          {rapper.tags.slice(0, 2).join(" / ")}
        </p>
        <div className="mt-1">
          <FondnessStat
            avgFondness={rapper.avgFondness}
            fondnessCount={rapper.fondnessCount}
            compact
            inverted={active}
          />
        </div>
        {!compact && (
          <p className={active ? "mt-1 text-xs text-black/55" : "mt-1 text-xs text-white/35"}>
            Flow {rapper.averageRatings.flow.toFixed(1)} · Lyrics{" "}
            {rapper.averageRatings.lyrics.toFixed(1)} · Stage{" "}
            {rapper.averageRatings.stage.toFixed(1)}
          </p>
        )}
      </div>
      <span className={`font-mono font-black ${compact ? "text-base" : "text-xl"}`}>
        {formatScore(rapper.overallScore ?? calculateOverallScore(rapper.averageRatings))}
      </span>
    </button>
  );
}
