import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  countRatingsForUser: vi.fn(),
  listRatingsPageForUser: vi.fn(),
  mapRatingRecordToUserRating: vi.fn((row: {
    userId: string;
    rapperId: string;
    flow: number;
    lyrics: number;
    voice: number;
    technique: number;
    melody: number;
    stage: number;
    ph: number;
    fondness: number | null;
    createdAt: string;
    updatedAt: string;
  }) => ({
    userId: row.userId,
    rapperId: row.rapperId,
    ratings: {
      flow: row.flow,
      lyrics: row.lyrics,
      voice: row.voice,
      technique: row.technique,
      melody: row.melody,
      stage: row.stage,
      ph: row.ph,
    },
    fondness: row.fondness,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })),
}));

vi.mock("@/features/favorites/favorite.repository", () => ({
  listFavoritesForUser: vi.fn(),
}));

vi.mock("@/features/ratings/rating.repository", () => ({
  countRatingsForUser: mocks.countRatingsForUser,
  listRatingsForUser: vi.fn(),
  listRatingsPageForUser: mocks.listRatingsPageForUser,
}));

vi.mock("@/features/rappers/rapper.mapper", () => ({
  mapRapperRecordToViewModel: vi.fn(),
  mapRatingRecordToUserRating: mocks.mapRatingRecordToUserRating,
}));

import { getViewerRatingsPage } from "@/features/user/user.server";

function createRatingRow(index: number) {
  return {
    userId: "viewer-1",
    rapperId: `rapper-${index}`,
    flow: 5,
    lyrics: 4,
    voice: 4,
    technique: 5,
    melody: 3,
    stage: 4,
    ph: 1,
    fondness: 5,
    createdAt: `2026-07-0${index}T00:00:00.000Z`,
    updatedAt: `2026-07-1${index}T00:00:00.000Z`,
    rapper: {
      id: `rapper-${index}`,
      name: `Rapper ${index}`,
      region: "CN",
      avatarUrl: `https://example.com/${index}.jpg`,
      mediaUrl: `https://example.com/${index}.jpg`,
      mediaType: "image" as const,
    },
  };
}

describe("getViewerRatingsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("falls back to the default page and page size for invalid values", async () => {
    mocks.countRatingsForUser.mockResolvedValue(10);
    mocks.listRatingsPageForUser.mockResolvedValue(
      Array.from({ length: 6 }, (_, index) => createRatingRow(index + 1)),
    );

    const result = await getViewerRatingsPage("viewer-1", 0, Number.NaN);

    expect(mocks.listRatingsPageForUser).toHaveBeenCalledWith({
      userId: "viewer-1",
      skip: 0,
      take: 6,
    });
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(6);
    expect(result.total).toBe(10);
    expect(result.totalPages).toBe(2);
    expect(result.items).toHaveLength(6);
  });

  it("clamps oversized page requests to the last page", async () => {
    mocks.countRatingsForUser.mockResolvedValue(10);
    mocks.listRatingsPageForUser.mockResolvedValue([createRatingRow(9), createRatingRow(10)]);

    const result = await getViewerRatingsPage("viewer-1", 99, 4);

    expect(mocks.listRatingsPageForUser).toHaveBeenCalledWith({
      userId: "viewer-1",
      skip: 8,
      take: 4,
    });
    expect(result.page).toBe(3);
    expect(result.totalPages).toBe(3);
    expect(result.items.map((item) => item.rapper.id)).toEqual(["rapper-9", "rapper-10"]);
  });

  it("returns a stable empty response when the user has no ratings", async () => {
    mocks.countRatingsForUser.mockResolvedValue(0);

    const result = await getViewerRatingsPage("viewer-1", 7, 3);

    expect(mocks.listRatingsPageForUser).not.toHaveBeenCalled();
    expect(result).toEqual({
      items: [],
      page: 1,
      pageSize: 3,
      total: 0,
      totalPages: 1,
    });
  });
});
