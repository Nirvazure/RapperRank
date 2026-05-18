import { prisma } from "@/lib/prisma";
import type { RatingDimension } from "@/features/ratings/rating.types";

export async function findRating(input: { userId: string; rapperId: string }) {
  return prisma.rating.findUnique({
    where: {
      userId_rapperId: input,
    },
  });
}

export async function createRating(input: {
  userId: string;
  rapperId: string;
  ratings: RatingDimension;
}) {
  return prisma.rating.create({
    data: {
      userId: input.userId,
      rapperId: input.rapperId,
      flow: input.ratings.flow,
      lyrics: input.ratings.lyrics,
      voice: input.ratings.voice,
      technique: input.ratings.technique,
      melody: input.ratings.melody,
      stage: input.ratings.stage,
      ph: input.ratings.ph ?? 0,
    },
  });
}

export async function updateRating(input: {
  userId: string;
  rapperId: string;
  ratings: RatingDimension;
}) {
  return prisma.rating.update({
    where: {
      userId_rapperId: {
        userId: input.userId,
        rapperId: input.rapperId,
      },
    },
    data: {
      flow: input.ratings.flow,
      lyrics: input.ratings.lyrics,
      voice: input.ratings.voice,
      technique: input.ratings.technique,
      melody: input.ratings.melody,
      stage: input.ratings.stage,
      ph: input.ratings.ph ?? 0,
    },
  });
}

export async function listRatingsForRapper(rapperId: string) {
  return prisma.rating.findMany({
    where: { rapperId },
  });
}

export async function listRatingsForUser(userId: string) {
  return prisma.rating.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
  });
}
