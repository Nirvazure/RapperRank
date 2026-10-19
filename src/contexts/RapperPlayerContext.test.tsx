import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RapperPlayerProvider, useRapperPlayer } from "./RapperPlayerContext";

vi.mock("@/lib/storage-media", () => ({
  resolveStorageAssetUrl: (src: string) => src === "https://old.oss/song.m4a"
    ? "https://storage.example/music/song.m4a" : src,
}));

function PlayerControl() {
  const { playRapperTrack } = useRapperPlayer();
  return <button onClick={() => playRapperTrack({ rapperId: "artist", title: "Song", subtitle: "Artist", src: "https://old.oss/song.m4a" })}>Play</button>;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe("migrated audio playback", () => {
  it("resolves cached OSS track URLs to the deployed 15 second preview before loading", () => {
    vi.useFakeTimers();
    const load = vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    const play = vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    const { container } = render(<RapperPlayerProvider><PlayerControl /></RapperPlayerProvider>);
    fireEvent.click(screen.getByRole("button", { name: "Play" }));
    act(() => vi.advanceTimersByTime(100));
    expect(container.querySelector("audio")).toHaveAttribute("src", "https://storage.example/music/song.m4a");
    expect(load).toHaveBeenCalledOnce();
    expect(play).toHaveBeenCalledOnce();
  });
});
