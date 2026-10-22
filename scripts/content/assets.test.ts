import { describe, expect, it } from "vitest";
import { playbackEvidenceSchema } from "./assets";

describe("playback evidence", () => {
  it("does not treat HTTP success as playback verification", () => {
    const evidence = { id: "s1", url: "https://embed.music.apple.com/us/album/test/123", checkedAt: new Date().toISOString(), outcome: "available", reviewer: "editor", note: "HTTP 200 received", observedSeconds: 0, durationSeconds: null, pausedObserved: false };
    expect(playbackEvidenceSchema.safeParse([evidence]).success).toBe(false);
    expect(playbackEvidenceSchema.safeParse([{ ...evidence, observedSeconds: 3, durationSeconds: 90, pausedObserved: true }]).success).toBe(true);
  });
  it("allows official external pages to be rechecked without approving audio", () => {
    const evidence = { id: "external-1", url: "https://music.apple.com/us/album/test/123", checkType: "external_page", checkedAt: new Date().toISOString(), outcome: "available", reviewer: "editor", note: "Observed artist, recording version and US subscription requirements", observedSeconds: 0, durationSeconds: null, pausedObserved: false };
    expect(playbackEvidenceSchema.safeParse([evidence]).success).toBe(false);
    expect(playbackEvidenceSchema.safeParse([{ ...evidence, officialPageObserved: true }]).success).toBe(true);
    expect(playbackEvidenceSchema.safeParse([{ ...evidence, checkType: "playback", officialPageObserved: true }]).success).toBe(false);
  });
});
