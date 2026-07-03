import { describe, expect, it } from "vitest";
import { rappers as seedRappers } from "@/data/rappers";
import { labelDefinitions } from "@/features/labels/label.data";
import { buildLabelViewModels } from "@/features/labels/label.utils";
import type { Rapper } from "@/features/rappers/rapper.types";

function toMockRappers(): Rapper[] {
  return seedRappers.map((record, index) => ({
    ...record,
    id: `mock-id-${index}`,
  }));
}

describe("label utils", () => {
  it("sorts labels by sortOrder", () => {
    const reversed = [...labelDefinitions].reverse();
    const labels = buildLabelViewModels(reversed, toMockRappers());

    expect(labels.map((label) => label.id)).toEqual(labelDefinitions.map((label) => label.id));
  });

  it("maps confirmed member seed keys onto rapper view data", () => {
    const mockRappers = toMockRappers();
    const labels = buildLabelViewModels(labelDefinitions, mockRappers);
    const cdc = labels.find((label) => label.id === "cdc");
    const expectedIds = ["wang-yitai", "xie-di", "ty", "mengzi-cdc", "sleepy-cat"].map(
      (seedKey) => mockRappers.find((rapper) => rapper.seedKey === seedKey)?.id,
    );

    expect(cdc?.members.map((member) => member.id)).toEqual(expectedIds);
    expect(cdc?.confirmedMemberCount).toBe(5);
    expect(cdc?.hasMembers).toBe(true);
  });

  it("ignores missing members without throwing", () => {
    const labels = buildLabelViewModels(
      [
        {
          ...labelDefinitions[0],
          id: "test",
          slug: "test",
          memberIds: ["missing-member"],
        },
      ],
      toMockRappers(),
    );

    expect(labels[0]?.members).toEqual([]);
    expect(labels[0]?.confirmedMemberCount).toBe(0);
    expect(labels[0]?.hasMembers).toBe(false);
  });

  it("preserves placeholder data for labels without members", () => {
    const labels = buildLabelViewModels(labelDefinitions, toMockRappers());
    const mdsk = labels.find((label) => label.id === "mdsk");

    expect(mdsk?.memberPlaceholder).toBe("成员数据待补充");
    expect(mdsk?.members).toEqual([]);
    expect(mdsk?.hasMembers).toBe(false);
  });

  it("keeps required identity fields populated", () => {
    const labels = buildLabelViewModels(labelDefinitions, toMockRappers());

    for (const label of labels) {
      expect(label.slug.length).toBeGreaterThan(0);
      expect(label.name.length).toBeGreaterThan(0);
      expect(label.logoUrl.length).toBeGreaterThan(0);
    }
  });
});
