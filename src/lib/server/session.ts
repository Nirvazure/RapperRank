const SESSION_TTL_DAYS = 30;

export type SessionRecord = {
  id: string;
  token: string;
  userId: string;
  expiresAt: Date;
};

export type SessionDeps = {
  now: () => Date;
  createUser: () => Promise<{ id: string }>;
  findSessionByToken: (token: string) => Promise<SessionRecord | null>;
  createSession: (input: { userId: string; expiresAt: Date }) => Promise<SessionRecord>;
};

export type AnonymousSession = {
  userId: string;
  sessionToken: string;
  expiresAt: Date;
  isNew: boolean;
};

export function isSessionExpired(expiresAt: Date, now: Date): boolean {
  return expiresAt.getTime() < now.getTime();
}

export function getSessionExpiry(now: Date): Date {
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + SESSION_TTL_DAYS);
  return expiresAt;
}

export async function ensureAnonymousSession(
  deps: SessionDeps,
  token: string | null,
): Promise<AnonymousSession> {
  const now = deps.now();

  if (token) {
    const existing = await deps.findSessionByToken(token);
    if (existing && !isSessionExpired(existing.expiresAt, now)) {
      return {
        userId: existing.userId,
        sessionToken: existing.token,
        expiresAt: existing.expiresAt,
        isNew: false,
      };
    }
  }

  const user = await deps.createUser();
  const expiresAt = getSessionExpiry(now);
  const session = await deps.createSession({
    userId: user.id,
    expiresAt,
  });

  return {
    userId: session.userId,
    sessionToken: session.token,
    expiresAt: session.expiresAt,
    isNew: true,
  };
}
