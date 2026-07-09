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
  fondness: number | null;
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
      fondness: input.fondness,
    },
  });
}

export async function updateRating(input: {
  userId: string;
  rapperId: string;
  ratings: RatingDimension;
  fondness: number | null;
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
      fondness: input.fondness,
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

export async function countRatingsForUser(userId: string) {
  return prisma.rating.count({
    where: { userId },
  });
}

export async function listRatingsPageForUser(input: {
  userId: string;
  skip: number;
  take: number;
}) {
  return prisma.rating.findMany({
    where: { userId: input.userId },
    orderBy: { updatedAt: "desc" },
    skip: input.skip,
    take: input.take,
    include: {
      rapper: {
        select: {
          id: true,
          name: true,
          region: true,
          avatarUrl: true,
          mediaUrl: true,
          mediaType: true,
        },
      },
    },
  });
}
