import { Heart } from "lucide-react";
import { formatFondnessAverage } from "@/features/ratings/rating.utils";

export function FondnessStat({
  avgFondness,
  fondnessCount,
  compact = false,
  inverted = false,
}: {
  avgFondness: number;
  fondnessCount: number;
  compact?: boolean;
  inverted?: boolean;
}) {
  const label = formatFondnessAverage(avgFondness, fondnessCount);

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono font-bold uppercase ${
        compact ? "text-[10px]" : "text-xs"
      } ${inverted ? "text-black/60" : "text-white/55"}`}
    >
      <Heart className={`${compact ? "size-3" : "size-3.5"} fill-red-500 text-red-500`} />
      <span>{label}</span>
      <span className={inverted ? "text-black/45" : "text-white/35"}>·</span>
      <span>{fondnessCount} 人评</span>
    </span>
  );
}
