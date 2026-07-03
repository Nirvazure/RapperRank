import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/server/auth", () => ({
  getAuthUser: vi.fn(),
}));

vi.mock("@/lib/server/auth-anonymous", () => ({
  getAnonymousViewer: vi.fn(),
}));

vi.mock("@/features/user/user.repository", () => ({
  ensureAuthenticatedUser: vi.fn(),
}));

vi.mock("@/features/user/user.merge", () => ({
  mergeAnonymousIntoAuthenticated: vi.fn(),
  getAnonymousSessionTokenFromCookieValue: vi.fn(),
  SESSION_COOKIE_NAME: "rapperank-session",
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: vi.fn(() => undefined),
    delete: vi.fn(),
  })),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: {
      findUnique: vi.fn(),
    },
  },
}));

import { getAuthUser } from "@/lib/server/auth";
import { getAnonymousViewer } from "@/lib/server/auth-anonymous";
import { ensureAuthenticatedUser } from "@/features/user/user.repository";
import { getViewer, resolvePageViewer } from "@/lib/server/viewer";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

describe("getViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns authenticated viewer when Supabase user exists", async () => {
    vi.mocked(getAuthUser).mockResolvedValue({
      id: "auth-uuid",
      app_metadata: {},
      user_metadata: { full_name: "Test User" },
      aud: "authenticated",
      created_at: "",
    } as never);

    vi.mocked(ensureAuthenticatedUser).mockResolvedValue({
      id: "db-user-1",
      displayName: "Test User",
      avatarUrl: "https://example.com/avatar.png",
      authUserId: "auth-uuid",
    });

    const viewer = await getViewer();

    expect(viewer).toEqual({
      userId: "db-user-1",
      displayName: "Test User",
      avatarUrl: "https://example.com/avatar.png",
      isAuthenticated: true,
    });
  });

  it("falls back to anonymous viewer when not authenticated", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    vi.mocked(getAnonymousViewer).mockResolvedValue({
      userId: "anon-user-1",
      sessionToken: "token-1",
    });

    const viewer = await getViewer();

    expect(viewer).toEqual({
      userId: "anon-user-1",
      displayName: "",
      isAuthenticated: false,
      sessionToken: "token-1",
    });
  });
});

describe("resolvePageViewer", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns anonymous viewer from existing session without creating a new one", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn((name: string) =>
        name === "rapperank-session" ? { value: "token-1" } : undefined,
      ),
    } as never);
    vi.mocked(prisma.session.findUnique).mockResolvedValue({
      userId: "anon-user-1",
      expiresAt: new Date(Date.now() + 60_000),
    } as never);

    const viewer = await resolvePageViewer();

    expect(viewer).toEqual({
      userId: "anon-user-1",
      displayName: "",
      isAuthenticated: false,
      sessionToken: "token-1",
    });
    expect(getAnonymousViewer).not.toHaveBeenCalled();
  });

  it("returns default anonymous viewer when session is missing", async () => {
    vi.mocked(getAuthUser).mockResolvedValue(null);
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn(() => undefined),
    } as never);

    const viewer = await resolvePageViewer();

    expect(viewer).toEqual({
      displayName: "",
      isAuthenticated: false,
    });
    expect(prisma.session.findUnique).not.toHaveBeenCalled();
    expect(getAnonymousViewer).not.toHaveBeenCalled();
  });
});
