import { describe, expect, it } from "vitest";
import { labelDefinitions } from "@/features/labels/label.data";
import { buildLabelViewModels } from "@/features/labels/label.utils";
import type { Rapper } from "@/features/rappers/rapper.types";

const emptyRatings = {
  flow: 0,
  lyrics: 0,
  voice: 0,
  technique: 0,
  melody: 0,
  stage: 0,
  ph: 0,
} as const;

function toMockRappers(): Rapper[] {
  return [
    {
      id: "mock-wang-yitai",
      seedKey: "wang-yitai",
      name: "王以太",
      aliases: [],
      region: "Chengdu",
      mediaType: "image",
      bio: "bio",
      tags: ["tag"],
      representativeWorks: ["song"],
      ratingCount: 0,
      averageRatings: { ...emptyRatings },
      avgFondness: 0,
      fondnessCount: 0,
    },
    {
      id: "mock-xie-di",
      seedKey: "xie-di",
      name: "谢帝",
      aliases: [],
      region: "Chengdu",
      mediaType: "image",
      bio: "bio",
      tags: ["tag"],
      representativeWorks: ["song"],
      ratingCount: 0,
      averageRatings: { ...emptyRatings },
      avgFondness: 0,
      fondnessCount: 0,
    },
    {
      id: "mock-ty",
      seedKey: "ty",
      name: "Ty.",
      aliases: [],
      region: "Chengdu",
      mediaType: "image",
      bio: "bio",
      tags: ["tag"],
      representativeWorks: ["song"],
      ratingCount: 0,
      averageRatings: { ...emptyRatings },
      avgFondness: 0,
      fondnessCount: 0,
    },
    {
      id: "mock-mengzi-cdc",
      seedKey: "mengzi-cdc",
      name: "孟子",
      aliases: [],
      region: "Chengdu",
      mediaType: "image",
      bio: "bio",
      tags: ["tag"],
      representativeWorks: ["song"],
      ratingCount: 0,
      averageRatings: { ...emptyRatings },
      avgFondness: 0,
      fondnessCount: 0,
    },
    {
      id: "mock-sleepy-cat",
      seedKey: "sleepy-cat",
      name: "Sleepy Cat",
      aliases: [],
      region: "Chengdu",
      mediaType: "image",
      bio: "bio",
      tags: ["tag"],
      representativeWorks: ["song"],
      ratingCount: 0,
      averageRatings: { ...emptyRatings },
      avgFondness: 0,
      fondnessCount: 0,
    },
  ];
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
