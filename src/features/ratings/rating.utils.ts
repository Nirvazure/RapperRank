import type { Rapper } from "@/features/rappers/rapper.types";
import type {
  PhOrientation,
  RatingDimension,
  UserRating,
} from "@/features/ratings/rating.types";
import {
  PH_ORIENTATION_LABELS,
  RATING_KEYS,
  RATING_SCORE_WEIGHTS,
} from "@/lib/constants";

export function calculateOverallScore(ratings: RatingDimension): number {
  const orientation = normalizePhOrientation(getPhRating(ratings));
  const weights = RATING_SCORE_WEIGHTS[orientation];
  const total = RATING_KEYS.reduce((sum, key) => sum + ratings[key] * weights[key], 0);
  return roundScore(total);
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

export function formatFondnessAverage(avgFondness: number, fondnessCount: number): string {
  if (fondnessCount === 0) {
    return "—";
  }

  return avgFondness.toFixed(1);
}

export function getPhRating(ratings: RatingDimension): number {
  return ratings.ph ?? 0;
}

export function normalizePhOrientation(ph?: number): PhOrientation {
  if ((ph ?? 0) <= -0.33) {
    return -1;
  }

  if ((ph ?? 0) >= 0.33) {
    return 1;
  }

  return 0;
}

export function inferPhOrientationFromRatings(ratings: RatingDimension): PhOrientation {
  const hardcoreAverage = (ratings.technique + ratings.flow + ratings.lyrics) / 3;
  const mainstreamAverage = (ratings.melody + ratings.voice + ratings.stage) / 3;
  const difference = hardcoreAverage - mainstreamAverage;

  if (difference >= 0.4) {
    return -1;
  }

  if (difference <= -0.4) {
    return 1;
  }

  return 0;
}

export function getPhOrientationLabel(ph?: number): string {
  return PH_ORIENTATION_LABELS[normalizePhOrientation(ph)];
}
