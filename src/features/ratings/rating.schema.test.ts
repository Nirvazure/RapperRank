import { describe, expect, it } from "vitest";
import { ratingDimensionSchema } from "@/features/ratings/rating.schema";

describe("rating schema", () => {
  it("accepts six valid 1-5 ratings", () => {
    expect(() =>
      ratingDimensionSchema.parse({
        flow: 5,
        lyrics: 4,
        voice: 3,
        technique: 2,
        melody: 1,
        stage: 4.5,
      }),
    ).not.toThrow();
  });

  it("rejects a rating above five", () => {
    expect(() =>
      ratingDimensionSchema.parse({
        flow: 6,
        lyrics: 4,
        voice: 3,
        technique: 2,
        melody: 1,
        stage: 4,
      }),
    ).toThrow();
  });
});
