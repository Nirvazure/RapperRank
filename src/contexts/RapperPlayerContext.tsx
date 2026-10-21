"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { resolveStorageAssetUrl } from "@/lib/storage-media";

type RapperTrack = { rapperId: string; src: string };
type RapperPlayerContextValue = {
  currentTrack: RapperTrack | null;
  isPlaying: boolean;
  error: string | null;
  playRapperTrack: (track: RapperTrack) => void;
  togglePlay: () => void;
  stopPlayback: () => void;
};

const RapperPlayerContext = createContext<RapperPlayerContextValue | null>(null);

export function RapperPlayerProvider({ children }: { children: ReactNode }) {
  const [currentTrack, setCurrentTrack] = useState<RapperTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<RapperTrack | null>(null);

  const stopPlayback = useCallback(() => {
    trackRef.current = null;
    const audio = audioRef.current;
    if (audio?.getAttribute("src")) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    }
    setCurrentTrack(null);
    setError(null);
    setIsPlaying(false);
  }, []);

  const playRapperTrack = useCallback((track: RapperTrack) => {
    const audio = audioRef.current;
    if (!audio) return;
    // A delayed automatic start must not override a manual pause of this artist.
    if (trackRef.current?.rapperId === track.rapperId && trackRef.current.src === track.src) return;

    stopPlayback();
    trackRef.current = track;
    setCurrentTrack(track);
    audio.src = resolveStorageAssetUrl(track.src);
    audio.load();
    void audio.play().catch(() => {
      if (trackRef.current === track) setIsPlaying(false);
    });
  }, [stopPlayback]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    const track = trackRef.current;
    if (!audio || !track) return;
    if (!audio.paused) {
      audio.pause();
      return;
    }
    setError(null);
    if (audio.error) audio.load();
    void audio.play().catch(() => {
      if (trackRef.current === track) setIsPlaying(false);
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleError = () => {
      setError("氛围片段暂时无法播放，请稍后重试。");
      setIsPlaying(false);
    };
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.pause();
    };
  }, []);

  return (
    <RapperPlayerContext.Provider value={{ currentTrack, isPlaying, error, playRapperTrack, togglePlay, stopPlayback }}>
      {children}
      <audio ref={audioRef} loop className="hidden" aria-hidden />
    </RapperPlayerContext.Provider>
  );
}

export function useRapperPlayer() {
  const context = useContext(RapperPlayerContext);
  if (!context) throw new Error("useRapperPlayer 必须在 RapperPlayerProvider 内部使用");
  return context;
}
