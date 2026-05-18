import { prisma } from "@/lib/prisma";

export async function findFavorite(input: { userId: string; rapperId: string }) {
  return prisma.favorite.findUnique({
    where: {
      userId_rapperId: input,
    },
  });
}

export async function createFavorite(input: { userId: string; rapperId: string }) {
  return prisma.favorite.create({
    data: input,
  });
}

export async function deleteFavorite(input: { userId: string; rapperId: string }) {
  return prisma.favorite.delete({
    where: {
      userId_rapperId: input,
    },
  });
}

export async function listFavoritesForUser(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      rapper: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
