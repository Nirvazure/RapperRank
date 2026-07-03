import { describe, expect, it } from "vitest";
import { rappers as seedRappers } from "@/data/rappers";
import { getRandomRapper, sortRappersByScore, sortRappersForCommunity } from "@/features/rappers/rapper.utils";
import { calculateOverallScore } from "@/features/ratings/rating.utils";
import type { Rapper } from "@/features/rappers/rapper.types";

function toRapper(
  record: (typeof seedRappers)[number],
  id: string,
  averageRatings: Rapper["averageRatings"],
  overallScore?: number,
  avgFondness = 0,
): Rapper {
  return {
    ...record,
    id,
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
      toRapper(seedRappers[0]!, "id-low", {
        flow: 3,
        lyrics: 3,
        voice: 3,
        technique: 3,
        melody: 3,
        stage: 3,
      }),
      toRapper(seedRappers[1]!, "id-high", {
        flow: 5,
        lyrics: 5,
        voice: 5,
        technique: 5,
        melody: 5,
        stage: 5,
      }),
      toRapper(seedRappers[2]!, "id-mid", {
        flow: 4,
        lyrics: 4,
        voice: 4,
        technique: 4,
        melody: 4,
        stage: 4,
      }),
    ];

    const sorted = sortRappersByScore(rappers);
    const scores = sorted.map((rapper) => calculateOverallScore(rapper.averageRatings));

    expect(scores).toEqual([...scores].sort((first, second) => second - first));
    expect(sorted[0]?.id).toBe("id-high");
  });

  it("breaks score ties with higher fondness first", () => {
    const tiedScore = {
      flow: 4,
      lyrics: 4,
      voice: 4,
      technique: 4,
      melody: 4,
      stage: 4,
    };
    const rappers: Rapper[] = [
      toRapper(seedRappers[0]!, "id-low-fondness", tiedScore, 4, 2),
      toRapper(seedRappers[1]!, "id-high-fondness", tiedScore, 4, 5),
    ];

    const sorted = sortRappersForCommunity(rappers, "score");

    expect(sorted[0]?.id).toBe("id-high-fondness");
  });

  it("sorts by fondness first and breaks ties with score", () => {
    const rappers: Rapper[] = [
      toRapper(
        seedRappers[0]!,
        "id-lower-score",
        { flow: 3, lyrics: 3, voice: 3, technique: 3, melody: 3, stage: 3 },
        3,
        5,
      ),
      toRapper(
        seedRappers[1]!,
        "id-higher-score",
        { flow: 5, lyrics: 5, voice: 5, technique: 5, melody: 5, stage: 5 },
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
    const list = seedRappers.map((rapper, index) =>
      toRapper(rapper, `id-${index}`, {
        flow: 0,
        lyrics: 0,
        voice: 0,
        technique: 0,
        melody: 0,
        stage: 0,
      }),
    );
    const selected = getRandomRapper(list);

    expect(selected).toBeDefined();
    expect(list.map((rapper) => rapper.id)).toContain(selected?.id);
  });
});
