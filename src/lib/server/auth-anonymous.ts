import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { SessionRecord } from "@/lib/server/session";
import { ensureAnonymousSession } from "@/lib/server/session";
import { SESSION_COOKIE_NAME } from "@/lib/server/session-cookie";
import { prisma } from "@/lib/prisma";

export async function getAnonymousViewer() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

  const session = await ensureAnonymousSession(
    {
      now: () => new Date(),
      createUser: async () =>
        prisma.user.create({
          data: {},
          select: { id: true },
        }),
      findSessionByToken: async (token) =>
        prisma.session.findUnique({
          where: { token },
          select: {
            id: true,
            token: true,
            userId: true,
            expiresAt: true,
          },
        }) as Promise<SessionRecord | null>,
      createSession: async ({ userId, expiresAt, token }) =>
        prisma.session.create({
          data: {
            userId,
            token: token ?? randomUUID(),
            expiresAt,
          },
          select: {
            id: true,
            token: true,
            userId: true,
            expiresAt: true,
          },
        }),
    },
    sessionToken,
  );

  return {
    userId: session.userId,
    sessionToken: session.sessionToken,
  };
}
