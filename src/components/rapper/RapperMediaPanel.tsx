import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Rapper } from "@/features/rappers/rapper.types";
import { calculateOverallScore, formatScore } from "@/features/ratings/rating.utils";

export function RapperMediaPanel({
  rapper,
  isFavorite,
  onToggleFavorite,
}: {
  rapper: Rapper;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <section className="relative aspect-[3/4] min-h-[420px] overflow-hidden rounded-lg border border-white/10 bg-black md:min-h-[560px] lg:min-h-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,255,0,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(255,46,91,0.22),transparent_28%)]" />
      <img
        src={rapper.mediaUrl}
        alt={`${rapper.name} visual`}
        className="rapper-visual absolute inset-0 h-full w-full object-cover opacity-80 mix-blend-luminosity"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.18)_34%,rgba(0,0,0,0.08)_54%,rgba(0,0,0,0.92)_100%)]" />
      <div className="absolute left-5 top-5 rounded-md bg-lime-300 px-3 py-1 font-mono text-xs font-black uppercase text-black shadow-lg shadow-black/30">
        {rapper.region}
      </div>
      <Button
        type="button"
        variant={isFavorite ? "default" : "outline"}
        size="icon-lg"
        aria-label={isFavorite ? "取消收藏" : "收藏"}
        onClick={onToggleFavorite}
        className={
          isFavorite
            ? "absolute right-5 top-5 bg-red-500 text-white hover:bg-red-400"
            : "absolute right-5 top-5 border-white/20 bg-black/35 text-white backdrop-blur hover:bg-white/15"
        }
      >
        <Heart className={isFavorite ? "fill-current" : ""} />
      </Button>
      <div className="absolute right-5 top-20 text-right">
        <div className="font-mono text-6xl font-black leading-none text-lime-200 drop-shadow-2xl">
          {formatScore(calculateOverallScore(rapper.averageRatings))}
        </div>
        <div className="font-mono text-xs font-black uppercase tracking-[0.18em] text-white/70">
          / 5.0 · {rapper.ratingCount.toLocaleString()} ratings
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6">
        <p className="font-mono text-xs font-bold uppercase tracking-[0.32em] text-lime-200">
          featured artist
        </p>
        <h1 className="max-w-[10ch] text-5xl font-black uppercase leading-[0.85] text-white sm:text-6xl md:text-7xl">
          {rapper.name}
        </h1>
        <p className="mt-3 line-clamp-2 max-w-xl text-base font-black leading-6 text-white/85">
          {rapper.shortReview}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {rapper.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-white/15 bg-black/35 px-2.5 py-1 text-xs font-black uppercase tracking-[0.16em] text-lime-100 backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
