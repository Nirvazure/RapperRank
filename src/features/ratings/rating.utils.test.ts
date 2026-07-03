import { describe, expect, it } from "vitest";
import type { Rapper } from "@/features/rappers/rapper.types";
import {
  calculateOverallScore,
  formatFondnessAverage,
  getUserRatingForRapper,
  inferPhOrientationFromRatings,
  mergeUserRatingIntoAverage,
  mergeUserRatingsIntoRappers,
  normalizePhOrientation,
} from "@/features/ratings/rating.utils";

describe("rating utils", () => {
  it("calculates the overall score with underground weights", () => {
    expect(
      calculateOverallScore({
        flow: 5,
        lyrics: 4,
        voice: 4,
        technique: 5,
        melody: 3,
        stage: 4,
        ph: -1,
      }),
    ).toBe(4.4);
  });

  it("calculates the overall score with mainstream weights", () => {
    expect(
      calculateOverallScore({
        flow: 3,
        lyrics: 3,
        voice: 5,
        technique: 3,
        melody: 5,
        stage: 4,
        ph: 1,
      }),
    ).toBe(4.1);
  });

  it("normalizes averaged orientation values into three display buckets", () => {
    expect(normalizePhOrientation(-0.34)).toBe(-1);
    expect(normalizePhOrientation(-0.32)).toBe(0);
    expect(normalizePhOrientation(0.32)).toBe(0);
    expect(normalizePhOrientation(0.33)).toBe(1);
  });

  it("infers the rapper orientation from six dimension ratings", () => {
    expect(
      inferPhOrientationFromRatings({
        flow: 5,
        lyrics: 5,
        voice: 3,
        technique: 5,
        melody: 3,
        stage: 3,
      }),
    ).toBe(-1);

    expect(
      inferPhOrientationFromRatings({
        flow: 3,
        lyrics: 3,
        voice: 5,
        technique: 3,
        melody: 5,
        stage: 5,
      }),
    ).toBe(1);

    expect(
      inferPhOrientationFromRatings({
        flow: 4,
        lyrics: 4,
        voice: 4,
        technique: 4,
        melody: 4,
        stage: 4,
      }),
    ).toBe(0);
  });

  it("merges a local user rating into displayed averages", () => {
    const rapper: Rapper = {
      id: "test",
      name: "Test",
      aliases: [],
      region: "Nowhere",
      avatarUrl: "https://example.com/a.jpg",
      mediaUrl: "https://example.com/b.jpg",
      mediaType: "image",
      bio: "bio",
      tags: ["tag"],
      representativeWorks: ["song"],
      ratingCount: 9,
      avgFondness: 0,
      fondnessCount: 0,
      averageRatings: {
        flow: 4,
        lyrics: 4,
        voice: 4,
        technique: 4,
        melody: 4,
        stage: 4,
        ph: 0,
      },
    };

    expect(
      mergeUserRatingIntoAverage(rapper, {
        flow: 5,
        lyrics: 5,
        voice: 5,
        technique: 5,
        melody: 5,
        stage: 5,
        ph: 1,
      }),
    ).toEqual({
      flow: 4.1,
      lyrics: 4.1,
      voice: 4.1,
      technique: 4.1,
      melody: 4.1,
      stage: 4.1,
      ph: 0.1,
    });
  });

  it("keeps averaged orientation values compatible with three bucket mapping", () => {
    const rapper: Rapper = {
      id: "test",
      name: "Test",
      aliases: [],
      region: "Nowhere",
      avatarUrl: "https://example.com/a.jpg",
      mediaUrl: "https://example.com/b.jpg",
      mediaType: "image",
      bio: "bio",
      tags: ["tag"],
      representativeWorks: ["song"],
      ratingCount: 1,
      avgFondness: 0,
      fondnessCount: 0,
      averageRatings: {
        flow: 4,
        lyrics: 4,
        voice: 4,
        technique: 4,
        melody: 4,
        stage: 4,
        ph: -1,
      },
    };

    const merged = mergeUserRatingIntoAverage(rapper, {
      flow: 4,
      lyrics: 4,
      voice: 4,
      technique: 4,
      melody: 4,
      stage: 4,
      ph: 1,
    });

    expect(merged.ph).toBe(0);
    expect(normalizePhOrientation(merged.ph)).toBe(0);
  });

  it("formats fondness average for empty community data", () => {
    expect(formatFondnessAverage(0, 0)).toBe("—");
    expect(formatFondnessAverage(4.2, 12)).toBe("4.2");
  });

  it("finds the local user's rating for a rapper", () => {
    const rating = {
      userId: "user",
      rapperId: "rapper-1",
      ratings: {
        flow: 4,
        lyrics: 4,
        voice: 4,
        technique: 4,
        melody: 4,
        stage: 4,
        ph: -1,
      },
      createdAt: "2026-05-08T00:00:00.000Z",
      updatedAt: "2026-05-08T00:00:00.000Z",
    };

    expect(getUserRatingForRapper([rating], "rapper-1")).toBe(rating);
    expect(getUserRatingForRapper([rating], "rapper-2")).toBeUndefined();
  });

  it("merges all local user ratings into a rapper list for display", () => {
    const rappers: Rapper[] = [
      {
        id: "rated",
        name: "Rated",
        aliases: [],
        region: "Nowhere",
        avatarUrl: "https://example.com/a.jpg",
        mediaUrl: "https://example.com/b.jpg",
        mediaType: "image",
        bio: "bio",
        tags: ["tag"],
        representativeWorks: ["song"],
        ratingCount: 9,
        avgFondness: 0,
        fondnessCount: 0,
        averageRatings: {
          flow: 4,
          lyrics: 4,
          voice: 4,
          technique: 4,
          melody: 4,
          stage: 4,
          ph: 0,
        },
      },
      {
        id: "untouched",
        name: "Untouched",
        aliases: [],
        region: "Nowhere",
        avatarUrl: "https://example.com/c.jpg",
        mediaUrl: "https://example.com/d.jpg",
        mediaType: "image",
        bio: "bio",
        tags: ["tag"],
        representativeWorks: ["song"],
        ratingCount: 3,
        avgFondness: 0,
        fondnessCount: 0,
        averageRatings: {
          flow: 3,
          lyrics: 3,
          voice: 3,
          technique: 3,
          melody: 3,
          stage: 3,
          ph: -1,
        },
      },
    ];

    const merged = mergeUserRatingsIntoRappers(rappers, [
      {
        userId: "user",
        rapperId: "rated",
        ratings: {
          flow: 5,
          lyrics: 5,
          voice: 5,
          technique: 5,
          melody: 5,
          stage: 5,
          ph: 1,
        },
        createdAt: "2026-05-08T00:00:00.000Z",
        updatedAt: "2026-05-08T00:00:00.000Z",
      },
    ]);

    expect(merged[0]?.ratingCount).toBe(10);
    expect(merged[0]?.averageRatings).toEqual({
      flow: 4.1,
      lyrics: 4.1,
      voice: 4.1,
      technique: 4.1,
      melody: 4.1,
      stage: 4.1,
      ph: 0.1,
    });
    expect(merged[1]).toBe(rappers[1]);
  });
});
