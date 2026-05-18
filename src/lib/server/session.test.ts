import { describe, expect, it, vi } from "vitest";
import { ensureAnonymousSession, isSessionExpired } from "@/lib/server/session";

describe("session service", () => {
  it("creates an anonymous user and session when token is missing", async () => {
    const deps = {
      now: () => new Date("2026-05-18T00:00:00.000Z"),
      createUser: vi.fn(async () => ({ id: "user-1" })),
      findSessionByToken: vi.fn(async () => null),
      createSession: vi.fn(async ({ userId, expiresAt }: { userId: string; expiresAt: Date }) => ({
        id: "session-1",
        token: "token-1",
        userId,
        expiresAt,
      })),
    };

    const result = await ensureAnonymousSession(deps, null);

    expect(result.userId).toBe("user-1");
    expect(result.sessionToken).toBe("token-1");
    expect(result.isNew).toBe(true);
    expect(deps.createUser).toHaveBeenCalledTimes(1);
    expect(deps.createSession).toHaveBeenCalledTimes(1);
  });

  it("reuses the incoming token when creating a missing session record", async () => {
    const deps = {
      now: () => new Date("2026-05-18T00:00:00.000Z"),
      createUser: vi.fn(async () => ({ id: "user-1" })),
      findSessionByToken: vi.fn(async () => null),
      createSession: vi.fn(
        async ({
          userId,
          expiresAt,
          token,
        }: {
          userId: string;
          expiresAt: Date;
          token?: string;
        }) => ({
          id: "session-1",
          token: token ?? "generated-token",
          userId,
          expiresAt,
        }),
      ),
    };

    const result = await ensureAnonymousSession(deps, "incoming-token");

    expect(result.userId).toBe("user-1");
    expect(result.sessionToken).toBe("incoming-token");
    expect(result.isNew).toBe(true);
    expect(deps.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ token: "incoming-token" }),
    );
  });

  it("reuses an existing active session", async () => {
    const deps = {
      now: () => new Date("2026-05-18T00:00:00.000Z"),
      createUser: vi.fn(async () => ({ id: "user-new" })),
      findSessionByToken: vi.fn(async () => ({
        id: "session-1",
        token: "token-1",
        userId: "user-1",
        expiresAt: new Date("2026-05-25T00:00:00.000Z"),
      })),
      createSession: vi.fn(),
    };

    const result = await ensureAnonymousSession(deps, "token-1");

    expect(result.userId).toBe("user-1");
    expect(result.sessionToken).toBe("token-1");
    expect(result.isNew).toBe(false);
    expect(deps.createUser).not.toHaveBeenCalled();
    expect(deps.createSession).not.toHaveBeenCalled();
  });

  it("rebuilds an expired session", async () => {
    const deps = {
      now: () => new Date("2026-05-18T00:00:00.000Z"),
      createUser: vi.fn(async () => ({ id: "user-2" })),
      findSessionByToken: vi.fn(async () => ({
        id: "session-expired",
        token: "expired-token",
        userId: "user-old",
        expiresAt: new Date("2026-05-17T00:00:00.000Z"),
      })),
      createSession: vi.fn(async ({ userId, expiresAt }: { userId: string; expiresAt: Date }) => ({
        id: "session-2",
        token: "token-2",
        userId,
        expiresAt,
      })),
    };

    const result = await ensureAnonymousSession(deps, "expired-token");

    expect(result.userId).toBe("user-2");
    expect(result.sessionToken).toBe("token-2");
    expect(result.isNew).toBe(true);
    expect(deps.createUser).toHaveBeenCalledTimes(1);
    expect(deps.createSession).toHaveBeenCalledTimes(1);
    expect(deps.createSession).toHaveBeenCalledWith(
      expect.objectContaining({ token: undefined }),
    );
  });

  it("treats expiresAt before now as expired", () => {
    expect(
      isSessionExpired(
        new Date("2026-05-17T23:59:59.000Z"),
        new Date("2026-05-18T00:00:00.000Z"),
      ),
    ).toBe(true);
  });
});
