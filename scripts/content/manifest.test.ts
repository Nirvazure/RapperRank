import { describe, expect, it } from "vitest";
import pilot from "../../data/content/pilot.json";
import { contentManifestSchema } from "./manifest";

describe("content manifest identity and review boundary", () => {
  it("accepts reviewed pilot data without storing external preview bytes or URLs", () => {
    expect(contentManifestSchema.safeParse(pilot).success).toBe(true);
    expect(JSON.stringify(pilot)).not.toContain("previewUrl");
  });
  it("rejects a same-disc slot collision and unknown timeline source", () => {
    const duplicate = structuredClone(pilot);
    duplicate.artists[1].albums[0].tracks[1].position = duplicate.artists[1].albums[0].tracks[0].position;
    expect(contentManifestSchema.safeParse(duplicate).success).toBe(false);
    const missing = structuredClone(pilot);
    missing.artists[0].timeline[0].sourceId = "unverified";
    expect(contentManifestSchema.safeParse(missing).success).toBe(false);
  });
  it("keeps unreviewed profile facts from being published", () => {
    const unreviewed = structuredClone(pilot);
    unreviewed.artists[0].sources[0].reviewStatus = "pending";
    expect(contentManifestSchema.safeParse(unreviewed).success).toBe(false);
  });
});
