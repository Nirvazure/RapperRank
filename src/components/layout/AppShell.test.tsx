import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "./AppShell";
import type { Rapper } from "@/features/rappers/rapper.types";

const { playRapperTrack, stopPlayback } = vi.hoisted(() => ({
  playRapperTrack: vi.fn(),
  stopPlayback: vi.fn(),
}));

vi.mock("@/contexts/RapperPlayerContext", () => ({
  useRapperPlayer: () => ({ playRapperTrack, stopPlayback }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
vi.mock("gsap", () => ({ default: { context: () => ({ revert: vi.fn() }) } }));
vi.mock("@/components/layout/PageHeader", () => ({ PageHeader: () => null }));
vi.mock("@/components/ratings/RatingDialog", () => ({ RatingDialog: () => null }));
vi.mock("@/components/rapper/RapperMediaPanel", () => ({ RapperMediaPanel: () => null }));
vi.mock("@/components/rapper/RapperRadarChartLazy", () => ({ RapperRadarChartLazy: () => null }));

const rapper: Rapper = {
  id: "artist-1", name: "Artist", region: "Region", aliases: [], mediaType: "image",
  backgroundAudioUrl: "https://storage.example/ambience.m4a", bio: "Bio", tags: [],
  representativeWorks: [], ratingCount: 0, avgFondness: 0, fondnessCount: 0,
  averageRatings: { flow: 0, lyrics: 0, voice: 0, technique: 0, melody: 0, stage: 0, ph: 0 },
};
const viewer = { displayName: "Visitor", isAuthenticated: false };

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("artist ambience", () => {
  it("starts automatically when the page is idle", () => {
    const requestIdleCallback = vi.fn();
    vi.stubGlobal("requestIdleCallback", requestIdleCallback);
    vi.stubGlobal("cancelIdleCallback", vi.fn());
    render(<AppShell rapper={rapper} isFavorite={false} myRating={null} viewer={viewer} />);

    expect(playRapperTrack).not.toHaveBeenCalled();
    act(() => requestIdleCallback.mock.calls[0][0]());
    expect(playRapperTrack).toHaveBeenCalledWith(expect.objectContaining({
      rapperId: rapper.id, src: rapper.backgroundAudioUrl,
    }));
  });

  it("cancels the previous artist's delayed start when switching artists", () => {
    vi.useFakeTimers();
    vi.stubGlobal("requestIdleCallback", undefined);
    const { rerender } = render(<AppShell rapper={rapper} isFavorite={false} myRating={null} viewer={viewer} />);
    act(() => vi.advanceTimersByTime(1000));
    const nextRapper = { ...rapper, id: "artist-2", backgroundAudioUrl: "https://storage.example/next.m4a" };
    rerender(<AppShell rapper={nextRapper} isFavorite={false} myRating={null} viewer={viewer} />);
    act(() => vi.advanceTimersByTime(1500));

    expect(stopPlayback).toHaveBeenCalledOnce();
    expect(playRapperTrack).toHaveBeenCalledOnce();
    expect(playRapperTrack).toHaveBeenCalledWith(expect.objectContaining({
      rapperId: nextRapper.id, src: nextRapper.backgroundAudioUrl,
    }));
  });
});
