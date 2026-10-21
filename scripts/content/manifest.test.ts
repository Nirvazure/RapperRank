import { describe, expect, it } from "vitest";
import { createManifestFixture } from "./manifest.fixture";
import { contentManifestSchema } from "./manifest";

describe("content manifest identity and review boundary", () => {
  it("accepts a reviewed manifest with related artist, track and album records", () => {
    expect(contentManifestSchema.safeParse(createManifestFixture()).success).toBe(true);
  });
  it("rejects a same-disc slot collision and unknown timeline source", () => {
    const duplicate = createManifestFixture();
    duplicate.artists[0].albums[0].tracks[1].position = duplicate.artists[0].albums[0].tracks[0].position;
    expect(contentManifestSchema.safeParse(duplicate).success).toBe(false);
    const missing = createManifestFixture();
    missing.artists[0].timeline[0].sourceId = "unverified";
    expect(contentManifestSchema.safeParse(missing).success).toBe(false);
  });
  it("keeps unreviewed profile facts from being published", () => {
    const unreviewed = createManifestFixture();
    unreviewed.artists[0].sources[0].reviewStatus = "pending";
    expect(contentManifestSchema.safeParse(unreviewed).success).toBe(false);
  });
});
