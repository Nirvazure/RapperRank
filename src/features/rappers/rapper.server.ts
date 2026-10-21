import { notFound } from "next/navigation";
import { getLocalMockViewerRapperState, isLocalMockViewerUserId } from "@/features/dev/local-mock.server";
import {
  findRapperById,
  updateRapperAggregate as updateRapperAggregateRecord,
} from "@/features/rappers/rapper.repository";
import { mapRapperRecordToViewModel, mapRatingRecordToUserRating } from "@/features/rappers/rapper.mapper";
import { findFavorite } from "@/features/favorites/favorite.repository";
import { findRating } from "@/features/ratings/rating.repository";
import type { RatingAggregate } from "@/features/ratings/rating.server";

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
  const rapper = mapRapperRecordToViewModel(record);

  if (isLocalMockViewerUserId(userId)) {
    const mockState = await getLocalMockViewerRapperState(record.id);

    return {
      rapper,
      isFavorite: mockState.isFavorite,
      myRating: mockState.myRating,
    };
  }

  if (!userId) {
    return {
      rapper,
      isFavorite: false,
      myRating: null,
    };
  }

  const [favorite, rating] = await Promise.all([
    findFavorite({ userId, rapperId: record.id }),
    findRating({ userId, rapperId: record.id }),
  ]);

  return {
    rapper,
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
    avgFondness: input.aggregate.avgFondness,
    fondnessCount: input.aggregate.fondnessCount,
  });
}
