import { describe, expect, it } from "vitest";
import { assetManifestSchema, playbackEvidenceSchema } from "./assets";

const asset = { id: "track-preview", owner: "track", ownerId: "track-1", kind: "audio_preview", file: "preview.m4a", sha256: "a".repeat(64), caption: "授权试听", attribution: "创作者", rightsBasis: "创作者授权站点分发此片段", redistributionAllowed: true, reviewStatus: "approved", source: { id: "license-1", title: "创作者许可", url: "https://example.org/license", retrievedAt: new Date().toISOString(), reviewer: "editor" } };
describe("reviewed asset import", () => {
  it("blocks platform audio and unlicensed full recordings", () => {
    expect(assetManifestSchema.safeParse(asset).success).toBe(true);
    expect(assetManifestSchema.safeParse({ ...asset, source: { ...asset.source, url: "https://audio-ssl.itunes.apple.com/preview.m4a" } }).success).toBe(false);
    expect(assetManifestSchema.safeParse({ ...asset, kind: "audio_full" }).success).toBe(false);
    expect(assetManifestSchema.safeParse({ ...asset, kind: "audio_full", fullAudioAuthorized: true }).success).toBe(true);
  });
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
