import { describe, expect, it, vi } from "vitest";
import { getRandomRapperIdFromDb, getTopRankedRappers } from "@/features/rappers/rapper.server";
import { pickRandomRapperId } from "@/features/rappers/rapper.repository";

vi.mock("@/features/rappers/rapper.repository", () => ({
  pickRandomRapperId: vi.fn(),
  findRapperById: vi.fn(),
}));

describe("rapper server", () => {
  it("returns ranking ordered by overall score descending", async () => {
    const deps = {
      listTopRappers: vi.fn(async () => [
        { id: "b", overallScore: 4.6 },
        { id: "a", overallScore: 4.9 },
      ]),
    };

    const result = await getTopRankedRappers(deps, 10);

    expect(result.map((item) => item.id)).toEqual(["a", "b"]);
  });

  it("returns a random rapper id from the repository", async () => {
    vi.mocked(pickRandomRapperId).mockResolvedValue("rapper-1");

    await expect(getRandomRapperIdFromDb()).resolves.toBe("rapper-1");
  });
});
