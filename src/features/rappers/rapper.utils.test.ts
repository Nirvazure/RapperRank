import { describe, expect, it } from "vitest";
import { getRandomRapper, sortRappersByScore, sortRappersForCommunity } from "@/features/rappers/rapper.utils";
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

function toRapper(
  id: string,
  name: string,
  averageRatings: Rapper["averageRatings"],
  overallScore?: number,
  avgFondness = 0,
): Rapper {
  return {
    id,
    seedKey: id,
    name,
    aliases: [],
    region: "Test",
    mediaType: "image",
    bio: "bio",
    tags: ["tag"],
    representativeWorks: ["song"],
    ratingCount: 10,
    averageRatings,
    overallScore,
    avgFondness,
    fondnessCount: avgFondness > 0 ? 10 : 0,
  };
}

describe("rapper utils", () => {
  it("sorts rappers by overall score from high to low", () => {
    const rappers: Rapper[] = [
      toRapper("id-low", "Low", { ...emptyRatings, flow: 3, lyrics: 3, voice: 3, technique: 3, melody: 3, stage: 3 }),
      toRapper("id-high", "High", { ...emptyRatings, flow: 5, lyrics: 5, voice: 5, technique: 5, melody: 5, stage: 5 }),
      toRapper("id-mid", "Mid", { ...emptyRatings, flow: 4, lyrics: 4, voice: 4, technique: 4, melody: 4, stage: 4 }),
    ];

    const sorted = sortRappersByScore(rappers);

    expect(sorted[0]?.id).toBe("id-high");
  });

  it("breaks score ties with higher fondness first", () => {
    const tiedScore = { ...emptyRatings, flow: 4, lyrics: 4, voice: 4, technique: 4, melody: 4, stage: 4 };
    const rappers: Rapper[] = [
      toRapper("id-low-fondness", "A", tiedScore, 4, 2),
      toRapper("id-high-fondness", "B", tiedScore, 4, 5),
    ];

    const sorted = sortRappersForCommunity(rappers, "score");

    expect(sorted[0]?.id).toBe("id-high-fondness");
  });

  it("sorts by fondness first and breaks ties with score", () => {
    const rappers: Rapper[] = [
      toRapper(
        "id-lower-score",
        "A",
        { ...emptyRatings, flow: 3, lyrics: 3, voice: 3, technique: 3, melody: 3, stage: 3 },
        3,
        5,
      ),
      toRapper(
        "id-higher-score",
        "B",
        { ...emptyRatings, flow: 5, lyrics: 5, voice: 5, technique: 5, melody: 5, stage: 5 },
        5,
        5,
      ),
    ];

    const sorted = sortRappersForCommunity(rappers, "fondness");

    expect(sorted[0]?.id).toBe("id-higher-score");
  });

  it("returns undefined when selecting a random rapper from an empty list", () => {
    expect(getRandomRapper([])).toBeUndefined();
  });

  it("returns a random rapper from the provided list", () => {
    const list = [
      toRapper("id-0", "A", emptyRatings),
      toRapper("id-1", "B", emptyRatings),
    ];
    const selected = getRandomRapper(list);

    expect(selected).toBeDefined();
    expect(list.map((rapper) => rapper.id)).toContain(selected?.id);
  });
});
