"use client";

import { StorageImage as Image } from "@/components/rapper/StorageImage";
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
  const { currentTrack, activeEmbed, error, stopPlayback, playbackState, togglePlay, seekTo, setVolume } = useRapperPlayer();

  if (activeEmbed) return <aside className="fixed inset-x-0 bottom-[calc(var(--rr-bottom-nav)+env(safe-area-inset-bottom,0px))] z-50 border-t border-white/20 bg-zinc-950 p-3 lg:bottom-0" aria-label="官方试听播放器"><div className="mx-auto max-w-4xl"><div className="mb-2 flex justify-between gap-3 text-xs text-white"><span className="truncate">{activeEmbed.title} · 官方试听</span><button onClick={stopPlayback} className="shrink-0 text-lime-200">关闭播放器</button></div><iframe key={activeEmbed.src} src={activeEmbed.src} title={`${activeEmbed.title} 官方播放器`} allow="autoplay *; encrypted-media *; fullscreen *" referrerPolicy="strict-origin-when-cross-origin" sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms" className="h-[175px] w-full rounded-lg border-0" /><p className="mt-1 text-[11px] text-white/50">若无法试听，请使用作品旁的官方完整播放入口。登录、会员与地区条件以平台为准。</p></div></aside>;

  if (!currentTrack) {
    return null;
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
      {error ? <p role="alert" className="px-4 py-1 text-xs text-red-200">{error}</p> : null}
      {/* Mobile mini bar */}
      <div className="flex h-14 items-center gap-3 px-3 lg:hidden">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-white/10 bg-black">
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={currentTrack.title}
              fill
              sizes="40px"
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
          <input type="range" min="0" max={playbackState.duration || 0} step="0.1" value={Math.min(playbackState.currentTime, playbackState.duration || 0)} disabled={!playbackState.duration} onChange={(event) => seekTo(Number(event.target.value))} aria-label="播放进度" className="mt-1.5 h-1 w-full cursor-pointer accent-lime-200" />
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
                sizes="56px"
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
            <input type="range" min="0" max={playbackState.duration || 0} step="0.1" value={Math.min(playbackState.currentTime, playbackState.duration || 0)} disabled={!playbackState.duration} onChange={(event) => seekTo(Number(event.target.value))} aria-label="播放进度" className="h-1.5 min-w-0 flex-1 cursor-pointer accent-lime-200" />
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
