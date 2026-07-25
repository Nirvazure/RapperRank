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
} from "@/contexts/rapper-player-types";

const RapperPlayerContext = createContext<RapperPlayerContextValue | null>(null);

export function RapperPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<RapperTrack | null>(null);
  const [playbackState, setPlaybackState] = useState<RapperPlaybackState>({
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
  });

  const audioRef = useRef<HTMLAudioElement>(null);

  const loadAudio = useCallback((src: string, autoPlay = false) => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.src = src;
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
      setCurrentTrack(track);
      setPlaybackState((prev) => ({
        ...prev,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
      }));
      window.setTimeout(() => loadAudio(track.src, autoPlay), 100);
    },
    [loadAudio],
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
    if (!audio) {
      return;
    }

    audio.currentTime = time;
    setPlaybackState((prev) => ({ ...prev, currentTime: time }));
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
      void audio.play().catch(() => {});
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const value: RapperPlayerContextValue = {
    currentTrack,
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
      <audio ref={audioRef} loop className="hidden" aria-hidden />
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
