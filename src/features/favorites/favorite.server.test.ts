import { describe, expect, it, vi } from "vitest";
import { addFavorite, removeFavorite } from "@/features/favorites/favorite.server";

describe("favorite server", () => {
  it("does not create duplicate favorites", async () => {
    const deps = {
      findFavorite: vi.fn(async () => ({ id: "favorite-1" })),
      createFavorite: vi.fn(async () => undefined),
      deleteFavorite: vi.fn(async () => undefined),
    };

    await addFavorite(deps, { userId: "user-1", rapperId: "rapper-1" });

    expect(deps.createFavorite).not.toHaveBeenCalled();
  });

  it("removes an existing favorite", async () => {
    const deps = {
      findFavorite: vi.fn(async () => ({ id: "favorite-1" })),
      createFavorite: vi.fn(async () => undefined),
      deleteFavorite: vi.fn(async () => undefined),
    };

    await removeFavorite(deps, { userId: "user-1", rapperId: "rapper-1" });

    expect(deps.deleteFavorite).toHaveBeenCalledTimes(1);
  });
});
