import { describe, expect, it } from "vitest";
import { matchRecording } from "./discovery";

describe("recording identity", () => {
  const candidate = { trackName: "不用去猜", artistName: "Jony J", artistId: 1288524146, trackId: 1 };
  it("matches an exact artist and recording, preserving the platform id", () => {
    expect(matchRecording([candidate], "不用去猜", [1288524146])).toEqual(candidate);
  });
  it("does not silently replace a studio recording by a live performance or cover", () => {
    expect(matchRecording([{ ...candidate, trackName: "不用去猜 (Live)" }], "不用去猜", [1288524146])).toBeNull();
    expect(matchRecording([{ ...candidate, artistId: 777 }], "不用去猜", [1288524146])).toBeNull();
  });
  it("accepts simplified/traditional titles only via an explicit reviewed alias", () => {
    expect(matchRecording([{ ...candidate, trackName: "親密愛人" }], "亲密爱人", [1288524146])).toBeNull();
    expect(matchRecording([{ ...candidate, trackName: "親密愛人" }], "亲密爱人", [1288524146], ["親密愛人"])?.trackId).toBe(1);
  });
});
