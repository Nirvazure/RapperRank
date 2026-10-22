import type { ContentManifest } from "./manifest";

/** Synthetic test records; no production artist IDs, biography or playback evidence. */
export function createManifestFixture(): ContentManifest {
  const source = (id: string) => ({
    id, title: "Example reviewed source", url: "https://example.org/catalog",
    fields: ["bio", "timeline"], retrievedAt: "2026-01-01T00:00:00.000Z",
    reviewStatus: "approved" as const, reviewer: "Test editor",
  });
  return {
    version: 1,
    artists: [{
      rapperId: "example-artist", name: "测试艺人", expectedBio: "Old example biography",
      bio: "这是仅用于校验导入结构的虚构艺人资料。".repeat(12),
      timeline: ["2020", "2021", "2022"].map((date) => ({ date, text: "Example event", sourceId: "profile-source" })),
      officialLinks: [{ label: "Example artist page", url: "https://example.org/artist" }],
      sources: [source("profile-source")],
      tracks: [1, 2].map((position) => ({
        id: `example-track-${position}`, title: `测试作品 ${position}`, artistCredit: "测试艺人",
        version: "录音室版本", releasedAt: "2021-01-01", durationMs: 180000,
        reviewStatus: "approved", role: "representative", source: source(`track-source-${position}`), playback: [],
      })),
      albums: [{
        id: "example-album", title: "测试专辑", artistCredit: "测试艺人", releasedAt: "2021-01-01",
        reviewStatus: "approved", source: source("album-source"), playback: [],
        tracks: [1, 2].map((position) => ({ trackId: `example-track-${position}`, discNumber: 1, position })),
      }],
      unresolvedWorks: [],
    }],
  };
}
