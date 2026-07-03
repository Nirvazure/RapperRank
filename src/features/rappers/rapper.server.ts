import { notFound } from "next/navigation";
import {
  findRapperById,
  pickRandomRapperId,
  updateRapperAggregate as updateRapperAggregateRecord,
} from "@/features/rappers/rapper.repository";
import { mapRapperRecordToViewModel, mapRatingRecordToUserRating } from "@/features/rappers/rapper.mapper";
import { findFavorite } from "@/features/favorites/favorite.repository";
import { findRating } from "@/features/ratings/rating.repository";
import { buildRatingAggregate, type RatingAggregate } from "@/features/ratings/rating.server";
import type { Rapper } from "@/features/rappers/rapper.types";

type RankedRapper = {
  id: string;
  overallScore: number;
};

export type RankingDeps = {
  listTopRappers: (limit: number) => Promise<RankedRapper[]>;
};

export async function getTopRankedRappers(
  deps: RankingDeps,
  limit: number,
): Promise<RankedRapper[]> {
  const rappers = await deps.listTopRappers(limit);
  return [...rappers].sort(
    (first, second) => (second.overallScore ?? 0) - (first.overallScore ?? 0),
  );
}

export async function getRandomRapperIdFromDb(fallback?: string) {
  const id = await pickRandomRapperId();
  if (id) {
    return id;
  }

  if (fallback) {
    const record = await findRapperById(fallback);
    if (record) {
      return record.id;
    }
  }

  throw new Error("No rappers available");
}

export async function getRankingPageData() {
  const { getCachedAllRappers, getCachedTopRappers } = await import(
    "@/features/rappers/rapper.cache"
  );
  const [rappers, rankingRecords] = await Promise.all([
    getCachedAllRappers(),
    getCachedTopRappers(10),
  ]);

  return {
    rappers: rappers.map(mapRapperRecordToViewModel),
    ranking: rankingRecords
      .map(mapRapperRecordToViewModel)
      .sort((first, second) => (second.overallScore ?? 0) - (first.overallScore ?? 0)),
  };
}

export async function getRapperPageData(rapperId: string, userId?: string) {
  const record = await findRapperById(rapperId);
  if (!record) {
    notFound();
  }

  if (!userId) {
    return {
      rapper: mapRapperRecordToViewModel(record),
      isFavorite: false,
      myRating: null,
    };
  }

  const [favorite, rating] = await Promise.all([
    findFavorite({ userId, rapperId: record.id }),
    findRating({ userId, rapperId: record.id }),
  ]);

  return {
    rapper: mapRapperRecordToViewModel(record),
    isFavorite: Boolean(favorite),
    myRating: rating ? mapRatingRecordToUserRating(rating) : null,
  };
}

export async function updateRapperAggregate(input: {
  rapperId: string;
  aggregate: RatingAggregate;
}) {
  const averageRatings = input.aggregate.averageRatings;
  await updateRapperAggregateRecord({
    rapperId: input.rapperId,
    ratingCount: input.aggregate.ratingCount,
    avgFlow: averageRatings.flow,
    avgLyrics: averageRatings.lyrics,
    avgVoice: averageRatings.voice,
    avgTechnique: averageRatings.technique,
    avgMelody: averageRatings.melody,
    avgStage: averageRatings.stage,
    avgPh: averageRatings.ph ?? 0,
    overallScore: input.aggregate.overallScore,
  });
}

export function sortByScoreDesc(rappers: Rapper[]) {
  return [...rappers].sort(
    (first, second) => (second.overallScore ?? 0) - (first.overallScore ?? 0),
  );
}

export { buildRatingAggregate };
