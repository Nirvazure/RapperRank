"use client";

import type { ReactNode } from "react";
import { Pause, Play } from "lucide-react";
import { useRapperPlayer } from "@/contexts/RapperPlayerContext";
import { FavoriteBookmarkButton } from "@/components/favorites/FavoriteBookmarkButton";
import { RapperLabelStrip } from "@/components/labels/RapperLabelStrip";
import { resolveRapperMedia } from "@/features/rappers/rapper.media";
import type { Rapper } from "@/features/rappers/rapper.types";
import { RapperImage } from "@/components/rapper/RapperImage";

export function RapperMediaPanel({
  rapper,
  isFavorite,
  onToggleFavorite,
  actionSlot,
}: {
  rapper: Rapper;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  actionSlot?: ReactNode;
}) {
  const media = resolveRapperMedia(rapper);
  const { currentTrack, isPlaying, error, playRapperTrack, togglePlay } = useRapperPlayer();
  const isCurrentTrack = currentTrack?.rapperId === rapper.id && currentTrack.src === rapper.backgroundAudioUrl;
  const isAmbiencePlaying = isCurrentTrack && isPlaying;
  const playbackLabel = `${isAmbiencePlaying ? "暂停" : "播放"}${rapper.name}的氛围片段`;

  function toggleAmbience() {
    if (!rapper.backgroundAudioUrl) return;
    if (isCurrentTrack) togglePlay();
    else playRapperTrack({ rapperId: rapper.id, src: rapper.backgroundAudioUrl });
  }

  return (
    <section className="relative isolate z-0 aspect-[4/3] max-h-[55svh] min-h-[280px] w-full overflow-hidden rounded-lg border border-white/10 bg-black sm:aspect-[16/10] sm:min-h-[300px] md:max-h-[38vh] md:min-h-[220px] xl:aspect-auto xl:h-full xl:max-h-none xl:min-h-0">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,255,0,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(255,46,91,0.22),transparent_28%)]" />
      <div className="rapper-visual absolute inset-0">
        <RapperImage
          src={media.src}
          alt={media.alt}
          priority
          className="object-cover opacity-80 mix-blend-luminosity"
        />
      </div>
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.78)_0%,rgba(0,0,0,0.18)_34%,rgba(0,0,0,0.08)_54%,rgba(0,0,0,0.92)_100%)]" />
      <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
        <div className="min-w-0 max-w-[40%] truncate rounded-md bg-lime-300 px-2.5 py-1.5 font-mono text-[11px] font-black uppercase text-black shadow-lg shadow-black/30" title={rapper.region}>
          {rapper.region}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {rapper.backgroundAudioUrl ? (
            <button
              type="button"
              onClick={toggleAmbience}
              aria-label={playbackLabel}
              aria-pressed={isAmbiencePlaying}
              title={playbackLabel}
              className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border border-white/25 bg-black/60 px-3 text-xs font-black text-white backdrop-blur transition hover:border-lime-200/60 hover:text-lime-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200 active:scale-[0.98] sm:h-10"
            >
              {isAmbiencePlaying ? <Pause className="size-4" fill="currentColor" /> : <Play className="size-4" fill="currentColor" />}
              <span className="hidden sm:inline">氛围</span>
            </button>
          ) : null}
          {actionSlot}
          <FavoriteBookmarkButton isFavorite={isFavorite} onToggle={onToggleFavorite} className="size-11 sm:size-10" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
        <div className="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="min-w-0 break-words text-left text-[clamp(1.875rem,8vw,3rem)] font-black uppercase leading-[1.05] text-white sm:text-5xl md:text-6xl">
              {rapper.name}
            </h1>
          </div>
          <RapperLabelStrip
            rapper={rapper}
            variant="featured"
            align="start"
            className="mt-0 min-w-0 max-w-full sm:justify-end"
          />
        </div>
        <p className="mt-2 line-clamp-2 max-w-xl text-sm font-black leading-5 text-white/85">
          {rapper.bio}
        </p>
        {isCurrentTrack && error ? <p role="alert" className="mt-2 text-xs text-red-200">{error}</p> : null}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {rapper.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="max-w-full break-words rounded-md border border-white/15 bg-black/35 px-2 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-lime-100 backdrop-blur"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
