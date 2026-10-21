import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RapperPlayerProvider, useRapperPlayer } from "./RapperPlayerContext";

vi.mock("@/lib/storage-media", () => ({
  resolveStorageAssetUrl: (src: string) => src === "https://old.oss/song.m4a"
    ? "https://storage.example/music/song.m4a" : src,
}));

function PlayerControl() {
  const { playRapperTrack, playEmbeddedTrack, stopPlayback, activeEmbed, currentTrack } = useRapperPlayer();
  return <><button onClick={() => playRapperTrack({ rapperId: "artist", title: "Song", subtitle: "Artist", src: "https://old.oss/song.m4a" })}>Play</button><button onClick={() => playEmbeddedTrack({ rapperId: "artist", title: "Official", src: "https://embed.music.apple.com/us/album/test/123?i=456" })}>Embed</button><button onClick={stopPlayback}>Stop</button><output>{activeEmbed ? "embedded" : currentTrack ? "native" : "stopped"}</output></>;
}

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.useRealTimers(); });

describe("migrated audio playback", () => {
  it("stops native audio before embedding and clears both players on stop", () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
    const pause = vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
    const { container } = render(<RapperPlayerProvider><PlayerControl /></RapperPlayerProvider>);
    fireEvent.click(screen.getByText("Play"));
    act(() => vi.advanceTimersByTime(100));
    fireEvent.click(screen.getByText("Embed"));
    expect(screen.getByText("embedded")).toBeInTheDocument();
    expect(pause).toHaveBeenCalled();
    expect(container.querySelector("audio")?.src).not.toContain("embed.music.apple.com");
    fireEvent.click(screen.getByText("Play"));
    expect(screen.getByText("native")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Stop"));
    expect(screen.getByText("stopped")).toBeInTheDocument();
    expect(container.querySelector("audio")).not.toHaveAttribute("src");
  });
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
