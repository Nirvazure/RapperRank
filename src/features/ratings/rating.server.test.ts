import { describe, expect, it, vi } from "vitest";
import type { RatingDimension } from "@/features/ratings/rating.types";
import { buildFondnessAggregate, upsertRapperRating } from "@/features/ratings/rating.server";

const sampleRatings: RatingDimension = {
  flow: 5,
  lyrics: 4,
  voice: 4,
  technique: 5,
  melody: 3,
  stage: 4,
  ph: -1,
};

describe("rating server", () => {
  it("creates a new rating when the user has not rated the rapper", async () => {
    const deps = {
      findRating: vi.fn(async () => null),
      createRating: vi.fn(async () => undefined),
      updateRating: vi.fn(async () => undefined),
      listRatingsForRapper: vi.fn(async () => [
        { ...sampleRatings, userId: "user-1", rapperId: "rapper-1", fondness: 5 },
      ]),
      updateRapperAggregate: vi.fn(async () => undefined),
    };

    await upsertRapperRating(deps, {
      userId: "user-1",
      rapperId: "rapper-1",
      ratings: sampleRatings,
      fondness: 5,
    });

    expect(deps.createRating).toHaveBeenCalledTimes(1);
    expect(deps.updateRating).not.toHaveBeenCalled();
    expect(deps.updateRapperAggregate).toHaveBeenCalledTimes(1);
  });

  it("updates the existing rating when the user re-rates the rapper", async () => {
    const deps = {
      findRating: vi.fn(async () => ({ id: "rating-1" })),
      createRating: vi.fn(async () => undefined),
      updateRating: vi.fn(async () => undefined),
      listRatingsForRapper: vi.fn(async () => [
        { ...sampleRatings, userId: "user-1", rapperId: "rapper-1", fondness: null },
      ]),
      updateRapperAggregate: vi.fn(async () => undefined),
    };

    await upsertRapperRating(deps, {
      userId: "user-1",
      rapperId: "rapper-1",
      ratings: sampleRatings,
      fondness: null,
    });

    expect(deps.createRating).not.toHaveBeenCalled();
    expect(deps.updateRating).toHaveBeenCalledTimes(1);
    expect(deps.updateRapperAggregate).toHaveBeenCalledTimes(1);
  });

  it("aggregates fondness only from ratings that include fondness", () => {
    expect(
      buildFondnessAggregate([
        { fondness: 5 },
        { fondness: 3 },
        { fondness: null },
      ]),
    ).toEqual({
      fondnessCount: 2,
      avgFondness: 4,
    });
  });
});
