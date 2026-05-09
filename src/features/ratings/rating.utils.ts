import type { Rapper } from "@/features/rappers/rapper.types";
import type { RatingDimension, UserRating } from "@/features/ratings/rating.types";
import { RATING_KEYS } from "@/lib/constants";

export function calculateOverallScore(ratings: RatingDimension): number {
  const total = RATING_KEYS.reduce((sum, key) => sum + ratings[key], 0);
  return roundScore(total / RATING_KEYS.length);
}

export function roundScore(value: number): number {
  return Math.round(value * 10) / 10;
}

export function mergeUserRatingIntoAverage(
  rapper: Rapper,
  userRating: RatingDimension,
): RatingDimension {
  const nextCount = rapper.ratingCount + 1;
  const merged = RATING_KEYS.reduce((nextRatings, key) => {
    nextRatings[key] = roundScore(
      (rapper.averageRatings[key] * rapper.ratingCount + userRating[key]) / nextCount,
    );
    return nextRatings;
  }, {} as RatingDimension);

  merged.ph = roundScore(
    (getPhRating(rapper.averageRatings) * rapper.ratingCount + getPhRating(userRating)) /
      nextCount,
  );

  return merged;
}

export function mergeUserRatingsIntoRappers(
  rappers: Rapper[],
  myRatings: UserRating[],
): Rapper[] {
  return rappers.map((rapper) => {
    const myRating = getUserRatingForRapper(myRatings, rapper.id);

    if (!myRating) {
      return rapper;
    }

    return {
      ...rapper,
      ratingCount: rapper.ratingCount + 1,
      averageRatings: mergeUserRatingIntoAverage(rapper, myRating.ratings),
    };
  });
}

export function getUserRatingForRapper(
  ratings: UserRating[],
  rapperId: string,
): UserRating | undefined {
  return ratings.find((rating) => rating.rapperId === rapperId);
}

export function formatScore(value: number): string {
  return value.toFixed(1);
}

export function getPhRating(ratings: RatingDimension): number {
  return ratings.ph ?? 0;
}
