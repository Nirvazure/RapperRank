import { describe, expect, it, vi, beforeEach } from "vitest";
import { UserKind } from "@prisma/client";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    session: {
      findUnique: vi.fn(),
    },
    favorite: {
      findMany: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
    },
    rating: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
    user: {
      delete: vi.fn(),
    },
    sessionDeleteMany: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    session: prismaMock.session,
    favorite: prismaMock.favorite,
    rating: prismaMock.rating,
    $transaction: prismaMock.$transaction,
    user: prismaMock.user,
  },
}));

import { mergeAnonymousIntoAuthenticated } from "@/features/user/user.merge";

describe("mergeAnonymousIntoAuthenticated", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("skips when anonymous session is missing", async () => {
    prismaMock.session.findUnique.mockResolvedValue(null);

    await mergeAnonymousIntoAuthenticated("auth-user-1", null);

    expect(prismaMock.$transaction).not.toHaveBeenCalled();
  });

  it("migrates favorites and keeps authenticated rating on conflict", async () => {
    prismaMock.session.findUnique.mockResolvedValue({
      userId: "anon-1",
      expiresAt: new Date(Date.now() + 60_000),
      user: { kind: UserKind.ANONYMOUS },
    });

    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof prismaMock) => Promise<void>) => {
      await callback({
        favorite: prismaMock.favorite,
        rating: prismaMock.rating,
        session: { deleteMany: vi.fn() },
        user: prismaMock.user,
      } as never);
    });

    prismaMock.favorite.findMany.mockResolvedValue([{ rapperId: "rapper-1" }]);
    prismaMock.rating.findMany.mockResolvedValue([
      { id: "rating-1", rapperId: "rapper-1", userId: "anon-1" },
      { id: "rating-2", rapperId: "rapper-2", userId: "anon-1" },
    ]);
    prismaMock.rating.findUnique
      .mockResolvedValueOnce({ id: "existing-rating" })
      .mockResolvedValueOnce(null);

    await mergeAnonymousIntoAuthenticated("auth-user-1", "session-token");

    expect(prismaMock.favorite.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_rapperId: {
            userId: "auth-user-1",
            rapperId: "rapper-1",
          },
        },
      }),
    );
    expect(prismaMock.rating.update).toHaveBeenCalledTimes(1);
    expect(prismaMock.rating.update).toHaveBeenCalledWith({
      where: { id: "rating-2" },
      data: { userId: "auth-user-1" },
    });
    expect(prismaMock.user.delete).toHaveBeenCalledWith({ where: { id: "anon-1" } });
  });
});
