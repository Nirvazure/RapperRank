"use client";

import Image from "next/image";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useRapperPlayer } from "@/contexts/RapperPlayerContext";
import { shouldBypassNextImageOptimization } from "@/features/rappers/rapper.media";

function formatTime(seconds: number): string {
  if (!seconds || Number.isNaN(seconds)) {
    return "0:00";
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function GlobalPlayerBar({ hideBottomNav = false }: { hideBottomNav?: boolean }) {
  const { currentTrack, playbackState, togglePlay, seekTo, setVolume } = useRapperPlayer();

  if (!currentTrack) {
    return null;
  }

  const progressPercentage =
    playbackState.duration > 0
      ? (playbackState.currentTime / playbackState.duration) * 100
      : 0;

  function handleProgressClick(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const percentage = (event.clientX - rect.left) / rect.width;
    seekTo(percentage * playbackState.duration);
  }

  const coverUrl = currentTrack.coverUrl;

  return (
    <div
      className={
        hideBottomNav
          ? "fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#0a0a0a]/95 pb-[env(safe-area-inset-bottom,0px)] shadow-2xl backdrop-blur-xl"
          : "fixed inset-x-0 bottom-[calc(var(--rr-bottom-nav)+env(safe-area-inset-bottom,0px))] z-50 border-t border-white/10 bg-[#0a0a0a]/95 shadow-2xl backdrop-blur-xl lg:bottom-0 lg:pb-[env(safe-area-inset-bottom,0px)]"
      }
    >
      {/* Mobile mini bar */}
      <div className="flex h-14 items-center gap-3 px-3 lg:hidden">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-black">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={currentTrack.title}
              fill
              className="object-cover"
              unoptimized={shouldBypassNextImageOptimization(coverUrl)}
            />
          ) : (
            <div className="flex h-full items-center justify-center font-mono text-[9px] font-black uppercase text-lime-200/70">
              RR
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate text-xs font-black uppercase text-white">{currentTrack.title}</h4>
          <div
            onClick={handleProgressClick}
            className="mt-1.5 h-1 cursor-pointer rounded-full bg-white/10"
          >
            <div
              className="h-full rounded-full bg-lime-200"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-lime-200 text-black transition-colors hover:bg-lime-100"
          aria-label={playbackState.isPlaying ? "暂停" : "播放"}
        >
          {playbackState.isPlaying ? (
            <Pause className="h-4 w-4" fill="currentColor" />
          ) : (
            <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
          )}
        </button>
      </div>

      {/* Desktop full bar */}
      <div className="hidden h-20 items-center gap-4 px-4 lg:flex">
        <div className="flex w-64 min-w-0 flex-shrink-0 items-center gap-3">
          <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
            {coverUrl ? (
              <Image
                src={coverUrl}
                alt={currentTrack.title}
                fill
                className="object-cover"
                unoptimized={shouldBypassNextImageOptimization(coverUrl)}
              />
            ) : (
              <div className="flex h-full items-center justify-center font-mono text-[10px] font-black uppercase text-lime-200/70">
                RR
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="truncate text-sm font-black uppercase text-white">{currentTrack.title}</h4>
            <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-white/50">
              {currentTrack.subtitle}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-200 text-black transition-colors hover:bg-lime-100"
              aria-label={playbackState.isPlaying ? "暂停" : "播放"}
            >
              {playbackState.isPlaying ? (
                <Pause className="h-5 w-5" fill="currentColor" />
              ) : (
                <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="min-w-[40px] text-right font-mono text-xs tabular-nums text-white/45">
              {formatTime(playbackState.currentTime)}
            </span>
            <div
              onClick={handleProgressClick}
              className="group relative h-1.5 flex-1 cursor-pointer rounded-full bg-white/10"
            >
              <div
                className="relative h-full rounded-full bg-lime-200 transition-all"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-lime-200 opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </div>
            <span className="min-w-[40px] font-mono text-xs tabular-nums text-white/45">
              {formatTime(playbackState.duration)}
            </span>
          </div>
        </div>

        <div className="flex w-32 flex-shrink-0 items-center gap-2">
          {playbackState.volume === 0 ? (
            <VolumeX className="h-4 w-4 text-white/45" />
          ) : (
            <Volume2 className="h-4 w-4 text-white/45" />
          )}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={playbackState.volume}
            onChange={(event) => setVolume(Number.parseFloat(event.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-white/10 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-lime-200"
            aria-label="音量"
          />
        </div>
      </div>
    </div>
  );
}
