import { describe, expect, it } from "vitest";
import { ratingDimensionSchema } from "@/features/ratings/rating.schema";

describe("rating schema", () => {
  it("accepts six valid 1-5 ratings and a three-bucket orientation rating", () => {
    expect(() =>
      ratingDimensionSchema.parse({
        flow: 5,
        lyrics: 4,
        voice: 3,
        technique: 2,
        melody: 1,
        stage: 4.5,
        ph: -1,
      }),
    ).not.toThrow();
  });

  it("accepts all three orientation values", () => {
    for (const ph of [-1, 0, 1]) {
      expect(() =>
        ratingDimensionSchema.parse({
          flow: 5,
          lyrics: 4,
          voice: 3,
          technique: 2,
          melody: 1,
          stage: 4,
          ph,
        }),
      ).not.toThrow();
    }
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
        ph: 0,
      }),
    ).toThrow();
  });

  it("rejects a PH rating outside the three-bucket range", () => {
    expect(() =>
      ratingDimensionSchema.parse({
        flow: 5,
        lyrics: 4,
        voice: 3,
        technique: 2,
        melody: 1,
        stage: 4,
        ph: 2,
      }),
    ).toThrow();
  });
});
