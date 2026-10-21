"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type {
  RapperPlaybackState,
  RapperPlayerContextValue,
  RapperTrack,
  EmbeddedTrack,
} from "@/contexts/rapper-player-types";
import { resolveStorageAssetUrl } from "@/lib/storage-media";

const RapperPlayerContext = createContext<RapperPlayerContextValue | null>(null);

export function RapperPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<RapperTrack | null>(null);
  const [activeEmbed, setActiveEmbed] = useState<EmbeddedTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [playbackState, setPlaybackState] = useState<RapperPlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const pendingLoad = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopPlayback = useCallback(() => {
    if (pendingLoad.current) clearTimeout(pendingLoad.current);
    const audio = audioRef.current;
    if (audio?.getAttribute("src")) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setCurrentTrack(null);
    setActiveEmbed(null);
    setError(null);
    setPlaybackState((prev) => ({ ...prev, isPlaying: false, currentTime: 0, duration: 0 }));
  }, []);
  const playEmbeddedTrack = useCallback((track: EmbeddedTrack) => {
    stopPlayback();
    setActiveEmbed(track);
  }, [stopPlayback]);

  const loadAudio = useCallback((src: string, autoPlay = false) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.src = resolveStorageAssetUrl(src);
    audio.load();
    if (!autoPlay) {
      return;
    }

    void audio.play().catch(() => {
      // Autoplay may be blocked (e.g. cold open). Keep UI as paused.
      setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
    });
  }, []);

  const playRapperTrack = useCallback(
    (track: RapperTrack, autoPlay = true) => {
      stopPlayback();
      setCurrentTrack(track);
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      }));
      pendingLoad.current = setTimeout(() => loadAudio(track.src, autoPlay), 100);
    },
    [loadAudio, stopPlayback],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (audio.paused) {
      void audio.play().catch(() => {
        setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
      });
    } else {
      audio.pause();
    }
  }, []);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(time) || !Number.isFinite(audio.duration) || audio.duration <= 0) {
      return;
    }

    const currentTime = Math.max(0, Math.min(time, audio.duration));
    audio.currentTime = currentTime;
    setPlaybackState((prev) => ({ ...prev, currentTime }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
    setPlaybackState((prev) => ({ ...prev, volume }));
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleTimeUpdate = () => {
      setPlaybackState((prev) => ({ ...prev, currentTime: audio.currentTime }));
    };
    const handleLoadedMetadata = () => {
      setPlaybackState((prev) => ({ ...prev, duration: audio.duration }));
    };
    const handlePlay = () => setPlaybackState((prev) => ({ ...prev, isPlaying: true }));
    const handlePause = () => setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
    const handleEnded = () => {
      setPlaybackState((prev) => ({ ...prev, isPlaying: false, currentTime: 0 }));
    };
    const handleError = () => { setError("音频暂时无法播放，请尝试官方播放入口。"); setPlaybackState((prev) => ({ ...prev, isPlaying: false })); };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      if (pendingLoad.current) clearTimeout(pendingLoad.current);
    };
  }, []);

  const value: RapperPlayerContextValue = {
    currentTrack,
    activeEmbed,
    error,
    playEmbeddedTrack,
    stopPlayback,
    playbackState,
    playRapperTrack,
    togglePlay,
    seekTo,
    setVolume,
    audioRef,
  };

  return (
    <RapperPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} loop={currentTrack?.loop ?? false} className="hidden" aria-hidden />
    </RapperPlayerContext.Provider>
  );
}

export function useRapperPlayer() {
  const context = useContext(RapperPlayerContext);
  if (!context) {
    throw new Error("useRapperPlayer 必须在 RapperPlayerProvider 内部使用");
  }
  return context;
}
