import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RapperPlayerProvider, useRapperPlayer } from "./RapperPlayerContext";

vi.mock("@/lib/storage-media", () => ({
  resolveStorageAssetUrl: (src: string) => src === "https://old.oss/song.m4a"
    ? "https://storage.example/music/song.m4a" : src,
}));

function PlayerControl() {
  const { playRapperTrack, togglePlay, stopPlayback, currentTrack, isPlaying, error } = useRapperPlayer();
  return <>
    <button onClick={() => playRapperTrack({ rapperId: "artist", src: "https://old.oss/song.m4a" })}>Play</button>
    <button onClick={() => playRapperTrack({ rapperId: "next", src: "https://storage.example/next.m4a" })}>Next</button>
    <button onClick={togglePlay}>Toggle</button>
    <button onClick={stopPlayback}>Stop</button>
    <output>{currentTrack ? `${currentTrack.rapperId}: ${isPlaying ? "playing" : "paused"}` : "stopped"}</output>
    {error ? <p role="alert">{error}</p> : null}
  </>;
}

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(() => {});
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

function mountPlayer() {
  const view = render(<RapperPlayerProvider><PlayerControl /></RapperPlayerProvider>);
  return { ...view, audio: view.container.querySelector("audio")! };
}

describe("artist ambience", () => {
  it("loads the migrated preview and automatically plays it in a loop", () => {
    const { audio } = mountPlayer();
    fireEvent.click(screen.getByText("Play"));
    expect(audio).toHaveAttribute("src", "https://storage.example/music/song.m4a");
    expect(audio).toHaveAttribute("loop");
    expect(audio.play).toHaveBeenCalledOnce();
  });

  it("does not let a delayed automatic start override a manual pause", () => {
    const { audio } = mountPlayer();
    fireEvent.click(screen.getByText("Play"));
    fireEvent.play(audio);
    vi.spyOn(audio, "paused", "get").mockReturnValue(false);
    fireEvent.click(screen.getByText("Toggle"));
    fireEvent.pause(audio);
    fireEvent.click(screen.getByText("Play"));
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(audio.play).toHaveBeenCalledOnce();
    expect(screen.getByText("artist: paused")).toBeInTheDocument();
  });

  it("lets the user play after the browser blocks autoplay", async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValueOnce(new Error("Autoplay blocked"));
    const { audio } = mountPlayer();
    await act(async () => { fireEvent.click(screen.getByText("Play")); });
    expect(screen.getByText("artist: paused")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Toggle"));
    fireEvent.play(audio);
    expect(audio.play).toHaveBeenCalledTimes(2);
    expect(screen.getByText("artist: playing")).toBeInTheDocument();
  });

  it("stops the old artist and unloads the source when leaving the page", () => {
    const { audio } = mountPlayer();
    fireEvent.click(screen.getByText("Play"));
    fireEvent.click(screen.getByText("Next"));
    expect(audio.pause).toHaveBeenCalledOnce();
    expect(audio).toHaveAttribute("src", "https://storage.example/next.m4a");
    fireEvent.click(screen.getByText("Stop"));
    expect(audio).not.toHaveAttribute("src");
    expect(screen.getByText("stopped")).toBeInTheDocument();
  });

  it("shows source errors and clears them when playback is retried", () => {
    const { audio } = mountPlayer();
    fireEvent.click(screen.getByText("Play"));
    fireEvent.error(audio);
    expect(screen.getByRole("alert")).toHaveTextContent("暂时无法播放");
    fireEvent.click(screen.getByText("Toggle"));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
