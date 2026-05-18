import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import type { SessionRecord } from "@/lib/server/session";
import { ensureAnonymousSession } from "@/lib/server/session";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "rapperank-session";

function createSessionToken(): string {
  return randomUUID();
}

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
      createSession: async ({ userId, expiresAt }) =>
        prisma.session.create({
          data: {
            userId,
            token: createSessionToken(),
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

  if (session.isNew || sessionToken !== session.sessionToken) {
    cookieStore.set(SESSION_COOKIE_NAME, session.sessionToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      expires: session.expiresAt,
      path: "/",
    });
  }

  return {
    userId: session.userId,
    sessionToken: session.sessionToken,
  };
}
