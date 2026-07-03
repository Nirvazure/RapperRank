import type { FondnessAggregate, RatingDimension } from "@/features/ratings/rating.types";
import {
  createRating as createRatingRecord,
  findRating as findRatingRecord,
  listRatingsForRapper as listRatingsForRapperRecords,
  updateRating as updateRatingRecord,
} from "@/features/ratings/rating.repository";
import { updateRapperAggregate } from "@/features/rappers/rapper.server";
import { calculateOverallScore, roundScore } from "@/features/ratings/rating.utils";

type StoredRating = RatingDimension & {
  userId: string;
  rapperId: string;
  fondness: number | null;
};

export type RatingAggregate = {
  ratingCount: number;
  averageRatings: RatingDimension;
  overallScore: number;
  fondnessCount: number;
  avgFondness: number;
};

export type RatingDeps = {
  findRating: (input: { userId: string; rapperId: string }) => Promise<{ id: string } | null>;
  createRating: (input: {
    userId: string;
    rapperId: string;
    ratings: RatingDimension;
    fondness: number | null;
  }) => Promise<void>;
  updateRating: (input: {
    userId: string;
    rapperId: string;
    ratings: RatingDimension;
    fondness: number | null;
  }) => Promise<void>;
  listRatingsForRapper: (rapperId: string) => Promise<StoredRating[]>;
  updateRapperAggregate: (input: { rapperId: string; aggregate: RatingAggregate }) => Promise<void>;
};

export function buildRatingAggregate(ratings: StoredRating[]): RatingAggregate {
  const fondnessAggregate = buildFondnessAggregate(ratings);

  if (ratings.length === 0) {
    return {
      ratingCount: 0,
      averageRatings: {
        flow: 0,
        lyrics: 0,
        voice: 0,
        technique: 0,
        melody: 0,
        stage: 0,
        ph: 0,
      },
      overallScore: 0,
      ...fondnessAggregate,
    };
  }

  const totals = ratings.reduce(
    (acc, item) => {
      acc.flow += item.flow;
      acc.lyrics += item.lyrics;
      acc.voice += item.voice;
      acc.technique += item.technique;
      acc.melody += item.melody;
      acc.stage += item.stage;
      acc.ph += item.ph ?? 0;
      return acc;
    },
    {
      flow: 0,
      lyrics: 0,
      voice: 0,
      technique: 0,
      melody: 0,
      stage: 0,
      ph: 0,
    },
  );

  const count = ratings.length;
  const averageRatings: RatingDimension = {
    flow: roundScore(totals.flow / count),
    lyrics: roundScore(totals.lyrics / count),
    voice: roundScore(totals.voice / count),
    technique: roundScore(totals.technique / count),
    melody: roundScore(totals.melody / count),
    stage: roundScore(totals.stage / count),
    ph: roundScore(totals.ph / count),
  };

  return {
    ratingCount: count,
    averageRatings,
    overallScore: calculateOverallScore(averageRatings),
    ...fondnessAggregate,
  };
}

export function buildFondnessAggregate(ratings: Pick<StoredRating, "fondness">[]): FondnessAggregate {
  const withFondness = ratings.filter(
    (item): item is { fondness: number } => item.fondness != null,
  );

  if (withFondness.length === 0) {
    return {
      fondnessCount: 0,
      avgFondness: 0,
    };
  }

  const total = withFondness.reduce((sum, item) => sum + item.fondness, 0);

  return {
    fondnessCount: withFondness.length,
    avgFondness: roundScore(total / withFondness.length),
  };
}

export async function upsertRapperRating(
  deps: RatingDeps,
  input: {
    userId: string;
    rapperId: string;
    ratings: RatingDimension;
    fondness: number | null;
  },
): Promise<RatingAggregate> {
  const existing = await deps.findRating({
    userId: input.userId,
    rapperId: input.rapperId,
  });

  if (existing) {
    await deps.updateRating(input);
  } else {
    await deps.createRating(input);
  }

  const ratings = await deps.listRatingsForRapper(input.rapperId);
  const aggregate = buildRatingAggregate(ratings);
  await deps.updateRapperAggregate({
    rapperId: input.rapperId,
    aggregate,
  });

  return aggregate;
}

export async function submitRapperRating(input: {
  userId: string;
  rapperId: string;
  ratings: RatingDimension;
  fondness: number | null;
}) {
  return upsertRapperRating(
    {
      findRating: findRatingRecord,
      createRating: async (payload) => {
        await createRatingRecord(payload);
      },
      updateRating: async (payload) => {
        await updateRatingRecord(payload);
      },
      listRatingsForRapper: async (rapperId) => {
        const rows = await listRatingsForRapperRecords(rapperId);
        return rows.map((item) => ({
          userId: item.userId,
          rapperId: item.rapperId,
          flow: Number(item.flow),
          lyrics: Number(item.lyrics),
          voice: Number(item.voice),
          technique: Number(item.technique),
          melody: Number(item.melody),
          stage: Number(item.stage),
          ph: Number(item.ph),
          fondness: item.fondness == null ? null : Number(item.fondness),
        }));
      },
      updateRapperAggregate,
    },
    input,
  );
}
