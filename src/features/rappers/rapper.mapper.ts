import type { Rapper as PrismaRapper, Rating } from "@prisma/client";
import type { RatingDimension, UserRating } from "@/features/ratings/rating.types";
import type { Rapper } from "@/features/rappers/rapper.types";

function toNumber(value: { toNumber: () => number } | number | string | null | undefined): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (!value) {
    return 0;
  }

  if (typeof value.toNumber === "function") {
    return value.toNumber();
  }

  const coerced = Number(value);
  return Number.isFinite(coerced) ? coerced : 0;
}

export function mapRatingRecordToUserRating(rating: Rating): UserRating {
  return {
    userId: rating.userId,
    rapperId: rating.rapperId,
    ratings: {
      flow: toNumber(rating.flow),
      lyrics: toNumber(rating.lyrics),
      voice: toNumber(rating.voice),
      technique: toNumber(rating.technique),
      melody: toNumber(rating.melody),
      stage: toNumber(rating.stage),
      ph: toNumber(rating.ph),
    },
    fondness: rating.fondness == null ? null : toNumber(rating.fondness),
    createdAt: rating.createdAt.toISOString(),
    updatedAt: rating.updatedAt.toISOString(),
  };
}

export function mapRapperRecordToViewModel(record: PrismaRapper): Rapper {
  const averageRatings: RatingDimension = {
    flow: toNumber(record.avgFlow),
    lyrics: toNumber(record.avgLyrics),
    voice: toNumber(record.avgVoice),
    technique: toNumber(record.avgTechnique),
    melody: toNumber(record.avgMelody),
    stage: toNumber(record.avgStage),
    ph: toNumber(record.avgPh),
  };

  return {
    id: record.id,
    seedKey: record.seedKey ?? undefined,
    name: record.name,
    aliases: record.aliases,
    labels: record.labels.length > 0 ? record.labels : undefined,
    region: record.region,
    avatarUrl: record.avatarUrl ?? undefined,
    mediaUrl: record.mediaUrl ?? undefined,
    mediaType: record.mediaType,
    backgroundAudioUrl: record.backgroundAudioUrl ?? undefined,
    bio: record.bio,
    tags: record.tags,
    representativeWorks: record.representativeWorks,
    ratingCount: record.ratingCount,
    averageRatings,
    overallScore: toNumber(record.overallScore),
    avgFondness: toNumber(record.avgFondness),
    fondnessCount: record.fondnessCount,
  };
}
