import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RapperMediaPanel } from "./RapperMediaPanel";
import type { Rapper } from "@/features/rappers/rapper.types";

const player = vi.hoisted(() => ({
  currentTrack: null as { rapperId: string; src: string } | null,
  isPlaying: false,
  error: null as string | null,
  playRapperTrack: vi.fn(),
  togglePlay: vi.fn(),
}));
vi.mock("@/contexts/RapperPlayerContext", () => ({ useRapperPlayer: () => player }));
vi.mock("@/components/rapper/RapperImage", () => ({ RapperImage: () => null }));
vi.mock("@/components/labels/RapperLabelStrip", () => ({ RapperLabelStrip: () => null }));

const rapper: Rapper = {
  id: "artist", name: "Artist", region: "Region", aliases: [], mediaType: "image",
  backgroundAudioUrl: "https://storage.example/ambience.m4a", bio: "Bio", tags: [],
  representativeWorks: [], ratingCount: 0, avgFondness: 0, fondnessCount: 0,
  averageRatings: { flow: 0, lyrics: 0, voice: 0, technique: 0, melody: 0, stage: 0, ph: 0 },
};

beforeEach(() => { player.currentTrack = null; player.isPlaying = false; player.error = null; });
afterEach(() => { cleanup(); vi.clearAllMocks(); });

describe("image ambience control", () => {
  it("has no playback control when the artist has no preview", () => {
    render(<RapperMediaPanel rapper={{ ...rapper, backgroundAudioUrl: undefined }} isFavorite={false} onToggleFavorite={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /氛围片段/ })).not.toBeInTheDocument();
  });

  it("starts the current artist from the image without a bottom player", () => {
    render(<RapperMediaPanel rapper={rapper} isFavorite={false} onToggleFavorite={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: "播放Artist的氛围片段" }));
    expect(player.playRapperTrack).toHaveBeenCalledWith({ rapperId: rapper.id, src: rapper.backgroundAudioUrl });
  });

  it("pauses a playing preview and exposes its current state", () => {
    player.currentTrack = { rapperId: rapper.id, src: rapper.backgroundAudioUrl! };
    player.isPlaying = true;
    render(<RapperMediaPanel rapper={rapper} isFavorite={false} onToggleFavorite={vi.fn()} />);
    const control = screen.getByRole("button", { name: "暂停Artist的氛围片段" });
    expect(control).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(control);
    expect(player.togglePlay).toHaveBeenCalledOnce();
    expect(player.playRapperTrack).not.toHaveBeenCalled();
  });

  it("shows playback errors beside the artist control", () => {
    player.currentTrack = { rapperId: rapper.id, src: rapper.backgroundAudioUrl! };
    player.error = "氛围片段暂时无法播放，请稍后重试。";
    render(<RapperMediaPanel rapper={rapper} isFavorite={false} onToggleFavorite={vi.fn()} />);
    expect(screen.getByRole("alert")).toHaveTextContent(player.error);
  });
});
