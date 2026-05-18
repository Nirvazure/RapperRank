import { describe, expect, it, vi } from "vitest";
import { getRandomRapperSlug, getTopRankedRappers } from "@/features/rappers/rapper.server";

describe("rapper server", () => {
  it("returns ranking ordered by overall score descending", async () => {
    const deps = {
      listTopRappers: vi.fn(async () => [
        { slug: "b", overallScore: 4.6 },
        { slug: "a", overallScore: 4.9 },
      ]),
    };

    const result = await getTopRankedRappers(deps, 10);

    expect(result.map((item) => item.slug)).toEqual(["a", "b"]);
  });

  it("returns a fallback slug when the repository returns no rappers", async () => {
    const deps = {
      listRapperSlugs: vi.fn(async () => []),
    };

    const slug = await getRandomRapperSlug(deps);

    expect(slug).toBe("kendrick-lamar");
  });
});
