import { UserKind } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE_NAME } from "@/lib/server/session-cookie";

async function findAnonymousUserIdBySessionToken(sessionToken: string | null) {
  if (!sessionToken) {
    return null;
  }

  const session = await prisma.session.findUnique({
    where: { token: sessionToken },
    select: {
      userId: true,
      expiresAt: true,
      user: {
        select: {
          kind: true,
        },
      },
    },
  });

  if (!session || session.expiresAt.getTime() < Date.now()) {
    return null;
  }

  if (session.user.kind !== UserKind.ANONYMOUS) {
    return null;
  }

  return session.userId;
}

export async function mergeAnonymousIntoAuthenticated(
  authenticatedUserId: string,
  anonymousSessionToken: string | null,
) {
  const anonymousUserId = await findAnonymousUserIdBySessionToken(anonymousSessionToken);

  if (!anonymousUserId || anonymousUserId === authenticatedUserId) {
    return;
  }

  await prisma.$transaction(async (tx) => {
    const anonymousFavorites = await tx.favorite.findMany({
      where: { userId: anonymousUserId },
      select: { rapperId: true },
    });

    for (const favorite of anonymousFavorites) {
      await tx.favorite.upsert({
        where: {
          userId_rapperId: {
            userId: authenticatedUserId,
            rapperId: favorite.rapperId,
          },
        },
        create: {
          userId: authenticatedUserId,
          rapperId: favorite.rapperId,
        },
        update: {},
      });
    }

    const anonymousRatings = await tx.rating.findMany({
      where: { userId: anonymousUserId },
    });

    for (const rating of anonymousRatings) {
      const existing = await tx.rating.findUnique({
        where: {
          userId_rapperId: {
            userId: authenticatedUserId,
            rapperId: rating.rapperId,
          },
        },
      });

      if (existing) {
        continue;
      }

      await tx.rating.update({
        where: { id: rating.id },
        data: { userId: authenticatedUserId },
      });
    }

    await tx.favorite.deleteMany({ where: { userId: anonymousUserId } });
    await tx.rating.deleteMany({ where: { userId: anonymousUserId } });
    await tx.session.deleteMany({ where: { userId: anonymousUserId } });
    await tx.user.delete({ where: { id: anonymousUserId } });
  });
}

export function getAnonymousSessionTokenFromCookieValue(cookieValue: string | undefined) {
  return cookieValue?.trim() || null;
}

export { SESSION_COOKIE_NAME };
