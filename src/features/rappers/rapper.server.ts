import { notFound } from "next/navigation";
import {
  findRapperBySlug,
  listAllRappers,
  listRapperSlugs,
  listTopRappers,
  updateRapperAggregate as updateRapperAggregateRecord,
} from "@/features/rappers/rapper.repository";
import { mapRapperRecordToViewModel, mapRatingRecordToUserRating } from "@/features/rappers/rapper.mapper";
import { findFavorite } from "@/features/favorites/favorite.repository";
import { findRating } from "@/features/ratings/rating.repository";
import { buildRatingAggregate, type RatingAggregate } from "@/features/ratings/rating.server";
import type { Rapper } from "@/features/rappers/rapper.types";

type RankedRapper = {
  slug: string;
  overallScore: number;
};

export type RankingDeps = {
  listTopRappers: (limit: number) => Promise<RankedRapper[]>;
};

export type RandomRapperDeps = {
  listRapperSlugs: () => Promise<string[]>;
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

export async function getRandomRapperSlug(deps: RandomRapperDeps): Promise<string> {
  const slugs = await deps.listRapperSlugs();
  if (slugs.length === 0) {
    return "kendrick-lamar";
  }

  const index = Math.floor(Math.random() * slugs.length);
  return slugs[index] ?? "kendrick-lamar";
}

export async function getRandomRapperSlugFromDb() {
  return getRandomRapperSlug({
    listRapperSlugs,
  });
}

export async function getRankingPageData() {
  const [rappers, rankingRecords] = await Promise.all([
    listAllRappers(),
    listTopRappers(10),
  ]);

  return {
    rappers: rappers.map(mapRapperRecordToViewModel),
    ranking: rankingRecords
      .map(mapRapperRecordToViewModel)
      .sort((first, second) => (second.overallScore ?? 0) - (first.overallScore ?? 0)),
  };
}

export async function getRapperPageData(slug: string, userId: string) {
  const record = await findRapperBySlug(slug);
  if (!record) {
    notFound();
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
