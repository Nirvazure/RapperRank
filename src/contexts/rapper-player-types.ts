import type { RefObject } from "react";

export type RapperPlaybackState = {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
};

export type RapperTrack = {
  rapperId: string;
  title: string;
  subtitle: string;
  coverUrl?: string;
  src: string;
  loop?: boolean;
};

export type EmbeddedTrack = { rapperId: string; title: string; src: string };

export type RapperPlayerContextValue = {
  currentTrack: RapperTrack | null;
  activeEmbed: EmbeddedTrack | null;
  error: string | null;
  playEmbeddedTrack: (track: EmbeddedTrack) => void;
  stopPlayback: () => void;
  playbackState: RapperPlaybackState;
  playRapperTrack: (track: RapperTrack, autoPlay?: boolean) => void;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (volume: number) => void;
  audioRef: RefObject<HTMLAudioElement | null>;
};
