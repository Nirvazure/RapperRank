import { describe, expect, it } from "vitest";
import type { Rapper } from "@/features/rappers/rapper.types";
import {
  calculateOverallScore,
  getUserRatingForRapper,
  mergeUserRatingIntoAverage,
  mergeUserRatingsIntoRappers,
} from "@/features/ratings/rating.utils";

describe("rating utils", () => {
  it("calculates the overall score from six dimensions", () => {
    expect(
      calculateOverallScore({
        flow: 5,
        lyrics: 4,
        voice: 4,
        technique: 5,
        melody: 3,
        stage: 4,
      }),
    ).toBe(4.2);
  });

  it("merges a local user rating into displayed averages", () => {
    const rapper: Rapper = {
      id: "test",
      name: "Test",
      region: "Nowhere",
      avatarUrl: "https://example.com/a.jpg",
      mediaUrl: "https://example.com/b.jpg",
      mediaType: "image",
      bio: "bio",
      shortReview: "review",
      tags: ["tag"],
      representativeWorks: ["song"],
      ratingCount: 9,
      averageRatings: {
        flow: 4,
        lyrics: 4,
        voice: 4,
        technique: 4,
        melody: 4,
        stage: 4,
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
      }),
    ).toEqual({
      flow: 4.1,
      lyrics: 4.1,
      voice: 4.1,
      technique: 4.1,
      melody: 4.1,
      stage: 4.1,
    });
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
        region: "Nowhere",
        avatarUrl: "https://example.com/a.jpg",
        mediaUrl: "https://example.com/b.jpg",
        mediaType: "image",
        bio: "bio",
        shortReview: "review",
        tags: ["tag"],
        representativeWorks: ["song"],
        ratingCount: 9,
        averageRatings: {
          flow: 4,
          lyrics: 4,
          voice: 4,
          technique: 4,
          melody: 4,
          stage: 4,
        },
      },
      {
        id: "untouched",
        name: "Untouched",
        region: "Nowhere",
        avatarUrl: "https://example.com/c.jpg",
        mediaUrl: "https://example.com/d.jpg",
        mediaType: "image",
        bio: "bio",
        shortReview: "review",
        tags: ["tag"],
        representativeWorks: ["song"],
        ratingCount: 3,
        averageRatings: {
          flow: 3,
          lyrics: 3,
          voice: 3,
          technique: 3,
          melody: 3,
          stage: 3,
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
    });
    expect(merged[1]).toBe(rappers[1]);
  });
});
