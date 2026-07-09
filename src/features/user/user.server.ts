import { listFavoritesForUser } from "@/features/favorites/favorite.repository";
import {
  getLocalMockViewerFavorites,
  getLocalMockViewerRatings,
  getLocalMockViewerRatingsPage,
  isLocalMockViewerUserId,
} from "@/features/dev/local-mock.server";
import { mapRapperRecordToViewModel, mapRatingRecordToUserRating } from "@/features/rappers/rapper.mapper";
import {
  countRatingsForUser,
  listRatingsForUser,
  listRatingsPageForUser,
} from "@/features/ratings/rating.repository";
import type { ViewerRatingListResponse } from "@/features/ratings/rating.types";

const DEFAULT_RATINGS_PAGE = 1;
const DEFAULT_RATINGS_PAGE_SIZE = 6;

export async function getViewerFavorites(userId: string) {
  if (isLocalMockViewerUserId(userId)) {
    return getLocalMockViewerFavorites();
  }

  const favorites = await listFavoritesForUser(userId);
  return favorites.map((favorite) => mapRapperRecordToViewModel(favorite.rapper));
}

export async function getViewerRatings(userId: string) {
  if (isLocalMockViewerUserId(userId)) {
    return getLocalMockViewerRatings();
  }

  const ratings = await listRatingsForUser(userId);
  return ratings.map(mapRatingRecordToUserRating);
}

function normalizePositiveInt(value: number, fallback: number) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

export async function getViewerRatingsPage(
  userId: string,
  page = DEFAULT_RATINGS_PAGE,
  pageSize = DEFAULT_RATINGS_PAGE_SIZE,
): Promise<ViewerRatingListResponse> {
  if (isLocalMockViewerUserId(userId)) {
    return getLocalMockViewerRatingsPage(page, pageSize);
  }

  const normalizedPage = normalizePositiveInt(page, DEFAULT_RATINGS_PAGE);
  const normalizedPageSize = normalizePositiveInt(pageSize, DEFAULT_RATINGS_PAGE_SIZE);
  const total = await countRatingsForUser(userId);

  if (total === 0) {
    return {
      items: [],
      page: DEFAULT_RATINGS_PAGE,
      pageSize: normalizedPageSize,
      total: 0,
      totalPages: 1,
    };
  }

  const totalPages = Math.max(1, Math.ceil(total / normalizedPageSize));
  const safePage = Math.min(normalizedPage, totalPages);
  const skip = (safePage - 1) * normalizedPageSize;
  const rows = await listRatingsPageForUser({
    userId,
    skip,
    take: normalizedPageSize,
  });

  return {
    items: rows.map((row) => ({
      rating: mapRatingRecordToUserRating(row),
      rapper: {
        id: row.rapper.id,
        name: row.rapper.name,
        region: row.rapper.region,
        avatarUrl: row.rapper.avatarUrl ?? undefined,
        mediaUrl: row.rapper.mediaUrl ?? undefined,
        mediaType: row.rapper.mediaType,
      },
    })),
    page: safePage,
    pageSize: normalizedPageSize,
    total,
    totalPages,
  };
}
