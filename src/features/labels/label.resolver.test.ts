import { describe, expect, it } from "vitest";
import { resolveRapperLabels, resolveRapperLabelsForArtist } from "@/features/labels/label.resolver";

describe("label resolver", () => {
  it("returns an empty list for missing labels", () => {
    expect(resolveRapperLabels()).toEqual([]);
    expect(resolveRapperLabels([])).toEqual([]);
  });

  it("matches labels by name and id case-insensitively", () => {
    const labels = resolveRapperLabels(["CDC", "gosh"]);

    expect(labels.map((label) => label.id)).toEqual(["cdc", "gosh"]);
    expect(labels[0]?.displayName).toContain("成都集团");
  });

  it("ignores unknown labels and deduplicates repeated keys", () => {
    const labels = resolveRapperLabels(["CDC", "cdc", "unknown-label"]);

    expect(labels).toHaveLength(1);
    expect(labels[0]?.name).toBe("CDC");
  });

  it("resolves pact from member seedKey and NOUS tag fallback", () => {
    const labels = resolveRapperLabelsForArtist({
      id: "rapper-pact",
      seedKey: "pact",
      labels: [],
      tags: ["Xi'an", "Chinese Rap", "NOUS", "Lyricist"],
    });

    expect(labels).toHaveLength(1);
    expect(labels[0]?.id).toBe("nous");
    expect(labels[0]?.logoUrl).toContain("/label/nous.jpg");
  });

  it("keeps explicit labels first and still merges inferred labels", () => {
    const labels = resolveRapperLabelsForArtist({
      id: "rapper-pact",
      seedKey: "pact",
      labels: ["CDC"],
      tags: ["NOUS"],
    });

    expect(labels.map((label) => label.id)).toEqual(["cdc", "nous"]);
  });
});