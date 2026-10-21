import { describe, expect, it } from "vitest";
import { isCheckedSource, safePlaybackUrl, canStoreAsset } from "./content.policy";

const now = new Date("2026-10-20T08:00:00Z");
const source = { kind: "embed", provider: "apple", url: "https://embed.music.apple.com/cn/album/test/123?i=456", status: "available", checkedAt: "2026-10-20T07:00:00Z", reviewStatus: "approved" };

describe("content source verification and asset rights", () => {
  it("does not treat a discovered or HTTP reachable URL as playback verified", () => {
    expect(isCheckedSource({ ...source, status: "pending" }, now)).toBe(false);
    expect(isCheckedSource({ ...source, checkedAt: null }, now)).toBe(false);
    expect(isCheckedSource({ ...source, reviewStatus: "pending" }, now)).toBe(false);
    expect(isCheckedSource(source, now)).toBe(true);
  });
  it("requires recent checks for both playback and official page sources", () => {
    expect(isCheckedSource({ ...source, checkedAt: "2026-08-01T00:00:00Z" }, now)).toBe(false);
    expect(isCheckedSource({ ...source, kind: "external", url: "https://music.apple.com/cn/album/test/123" }, now)).toBe(true);
    expect(isCheckedSource({ ...source, checkedAt: "2027-01-01T00:00:00Z" }, now)).toBe(false);
  });
  it("rejects credentials, lookalike hosts and arbitrary iframe HTML", () => {
    expect(safePlaybackUrl(source)).toBe(source.url);
    for (const url of ["javascript:alert(1)", "https://embed.music.apple.com.evil.test/cn/album/1", "https://user:pass@embed.music.apple.com/cn/album/1", "https://embed.music.apple.com:444/cn/album/1", "https://embed.music.apple.com/unknown"]) {
      expect(safePlaybackUrl({ ...source, url })).toBeNull();
    }
  });
  it("never permits copying platform previews merely because they are playable", () => {
    expect(canStoreAsset({ reviewStatus: "approved", rightsBasis: "Apple preview", sourceUrl: "https://audio-ssl.itunes.apple.com/a.m4a", redistributionAllowed: true })).toBe(false);
    expect(canStoreAsset({ reviewStatus: "pending", rightsBasis: "Artist permission", sourceUrl: "https://artist.example/a.m4a", redistributionAllowed: true })).toBe(false);
    expect(canStoreAsset({ reviewStatus: "approved", rightsBasis: "", sourceUrl: "https://artist.example/a.m4a", redistributionAllowed: true })).toBe(false);
    expect(canStoreAsset({ reviewStatus: "approved", rightsBasis: "Written permission", sourceUrl: "https://artist.example/a.m4a", redistributionAllowed: true })).toBe(true);
  });
});
