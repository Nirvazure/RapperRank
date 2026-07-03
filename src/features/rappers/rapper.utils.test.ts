import { describe, expect, it } from "vitest";
import { rappers as seedRappers } from "@/data/rappers";
import { getRandomRapper, sortRappersByScore } from "@/features/rappers/rapper.utils";
import { calculateOverallScore } from "@/features/ratings/rating.utils";

describe("rapper utils", () => {
  it("sorts rappers by overall score from high to low", () => {
    const sorted = sortRappersByScore(
      seedRappers.map((rapper, index) => ({
        ...rapper,
        id: `id-${index}`,
      })),
    );
    const scores = sorted.map((rapper) => calculateOverallScore(rapper.averageRatings));

    expect(scores).toEqual([...scores].sort((first, second) => second - first));
    expect(sorted[0]?.seedKey).toBe("kendrick-lamar");
  });

  it("returns undefined when selecting a random rapper from an empty list", () => {
    expect(getRandomRapper([])).toBeUndefined();
  });

  it("returns a random rapper from the provided list", () => {
    const list = seedRappers.map((rapper, index) => ({
      ...rapper,
      id: `id-${index}`,
    }));
    const selected = getRandomRapper(list);

    expect(selected).toBeDefined();
    expect(list.map((rapper) => rapper.id)).toContain(selected?.id);
  });
});
