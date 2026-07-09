import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { mapRapperRecordToViewModel } from "@/features/rappers/rapper.mapper";
import { listAllRappers } from "@/features/rappers/rapper.repository";
import type { Rapper } from "@/features/rappers/rapper.types";
import type {
  RatingSubmission,
  UserRating,
  ViewerRatingListResponse,
} from "@/features/ratings/rating.types";

export const LOCAL_MOCK_VIEWER_USER_ID = "local-dev-viewer";
const LOCAL_MOCK_DISPLAY_NAME = "Local Demo";
const LOCAL_MOCK_RATINGS_TOTAL = 20;
const LOCAL_MOCK_FAVORITES_TOTAL = 8;
const LOCAL_MOCK_RATINGS_PAGE_SIZE = 6;
const LOCAL_MOCK_STATE_PATH = path.join(process.cwd(), ".dev-data", "local-mock-viewer.json");

type LocalMockState = {
  favorites: string[];
  ratings: UserRating[];
};

type LocalMockViewer = {
  userId: string;
  displayName: string;
  avatarUrl?: string;
  isAuthenticated: boolean;
};

export function isLocalMockViewerEnabled() {
  return (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_RAPPERRANK_ENABLE_DEV_MOCK_VIEWER === "1"
  );
}

export function isLocalMockViewerUserId(userId?: string) {
  return userId === LOCAL_MOCK_VIEWER_USER_ID;
}

export function getLocalMockViewer(): LocalMockViewer {
  return {
    userId: LOCAL_MOCK_VIEWER_USER_ID,
    displayName: LOCAL_MOCK_DISPLAY_NAME,
    isAuthenticated: true,
  };
}

function normalizePositiveInt(value: number, fallback: number) {
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function sortRatingsByUpdatedAtDesc(ratings: UserRating[]) {
  return [...ratings].sort(
    (left, right) => Date.parse(right.updatedAt) - Date.parse(left.updatedAt),
  );
}

function buildMockRatingsForRappers(rappers: Rapper[]): UserRating[] {
  const now = Date.now();

  return rappers.slice(0, LOCAL_MOCK_RATINGS_TOTAL).map((rapper, index) => {
    const updatedAt = new Date(now - index * 3 * 60 * 60 * 1000).toISOString();
    const createdAt = new Date(now - (index + 2) * 24 * 60 * 60 * 1000).toISOString();
    const phValues = [-1, 0, 1] as const;

    return {
      userId: LOCAL_MOCK_VIEWER_USER_ID,
      rapperId: rapper.id,
      ratings: {
        flow: 3 + (index % 3),
        lyrics: 2 + ((index + 1) % 4),
        voice: 3 + ((index + 2) % 3),
        technique: 3 + ((index + 1) % 3),
        melody: 2 + ((index + 2) % 4),
        stage: 3 + ((index + 3) % 3),
        ph: phValues[index % phValues.length],
      },
      fondness: index % 5 === 0 ? null : ((index % 5) + 1),
      createdAt,
      updatedAt,
    };
  });
}

async function getMockRapperMap() {
  const records = await listAllRappers();
  const rappers = records.map(mapRapperRecordToViewModel);
  return new Map(rappers.map((rapper) => [rapper.id, rapper]));
}

async function buildInitialLocalMockState(): Promise<LocalMockState> {
  const rapperMap = await getMockRapperMap();
  const rappers = [...rapperMap.values()];
  const ratings = sortRatingsByUpdatedAtDesc(buildMockRatingsForRappers(rappers));

  return {
    favorites: ratings.slice(0, LOCAL_MOCK_FAVORITES_TOTAL).map((rating) => rating.rapperId),
    ratings,
  };
}

async function writeLocalMockState(state: LocalMockState) {
  await mkdir(path.dirname(LOCAL_MOCK_STATE_PATH), { recursive: true });
  await writeFile(LOCAL_MOCK_STATE_PATH, JSON.stringify(state, null, 2), "utf8");
  return state;
}

function isLocalMockState(value: unknown): value is LocalMockState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const state = value as Partial<LocalMockState>;
  return Array.isArray(state.favorites) && Array.isArray(state.ratings);
}

async function readLocalMockState(): Promise<LocalMockState | null> {
  try {
    const content = await readFile(LOCAL_MOCK_STATE_PATH, "utf8");
    const parsed = JSON.parse(content) as unknown;
    return isLocalMockState(parsed)
      ? {
          favorites: parsed.favorites,
          ratings: sortRatingsByUpdatedAtDesc(parsed.ratings),
        }
      : null;
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "ENOENT"
    ) {
      return null;
    }

    return null;
  }
}

async function ensureLocalMockState() {
  const state = await readLocalMockState();
  if (state) {
    return state;
  }

  return writeLocalMockState(await buildInitialLocalMockState());
}

export async function getLocalMockViewerFavorites() {
  const [state, rapperMap] = await Promise.all([ensureLocalMockState(), getMockRapperMap()]);

  return state.favorites.flatMap((rapperId) => {
    const rapper = rapperMap.get(rapperId);
    return rapper ? [rapper] : [];
  });
}

export async function getLocalMockViewerRatings() {
  const state = await ensureLocalMockState();
  return sortRatingsByUpdatedAtDesc(state.ratings);
}

export async function getLocalMockViewerRatingsPage(
  page = 1,
  pageSize = LOCAL_MOCK_RATINGS_PAGE_SIZE,
): Promise<ViewerRatingListResponse> {
  const [ratings, rapperMap] = await Promise.all([
    getLocalMockViewerRatings(),
    getMockRapperMap(),
  ]);
  const normalizedPage = normalizePositiveInt(page, 1);
  const normalizedPageSize = normalizePositiveInt(pageSize, LOCAL_MOCK_RATINGS_PAGE_SIZE);
  const items = ratings.flatMap((rating) => {
    const rapper = rapperMap.get(rating.rapperId);
    return rapper
      ? [
          {
            rating,
            rapper: {
              id: rapper.id,
              name: rapper.name,
              region: rapper.region,
              avatarUrl: rapper.avatarUrl,
              mediaUrl: rapper.mediaUrl,
              mediaType: rapper.mediaType,
            },
          },
        ]
      : [];
  });

  if (items.length === 0) {
    return {
      items: [],
      page: 1,
      pageSize: normalizedPageSize,
      total: 0,
      totalPages: 1,
    };
  }

  const totalPages = Math.max(1, Math.ceil(items.length / normalizedPageSize));
  const safePage = Math.min(normalizedPage, totalPages);
  const start = (safePage - 1) * normalizedPageSize;

  return {
    items: items.slice(start, start + normalizedPageSize),
    page: safePage,
    pageSize: normalizedPageSize,
    total: items.length,
    totalPages,
  };
}

export async function getLocalMockViewerRapperState(rapperId: string) {
  const state = await ensureLocalMockState();

  return {
    isFavorite: state.favorites.includes(rapperId),
    myRating: state.ratings.find((rating) => rating.rapperId === rapperId) ?? null,
  };
}

export async function setLocalMockFavorite(rapperId: string, shouldFavorite: boolean) {
  const state = await ensureLocalMockState();
  const favorites = shouldFavorite
    ? [rapperId, ...state.favorites.filter((item) => item !== rapperId)]
    : state.favorites.filter((item) => item !== rapperId);

  return writeLocalMockState({
    ...state,
    favorites,
  });
}

export async function submitLocalMockRating(input: {
  rapperId: string;
  submission: RatingSubmission;
}) {
  const state = await ensureLocalMockState();
  const now = new Date().toISOString();
  const existing = state.ratings.find((rating) => rating.rapperId === input.rapperId);
  const nextRating: UserRating = {
    userId: LOCAL_MOCK_VIEWER_USER_ID,
    rapperId: input.rapperId,
    ratings: input.submission.ratings,
    fondness: input.submission.fondness,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  };
  const nextRatings = sortRatingsByUpdatedAtDesc([
    nextRating,
    ...state.ratings.filter((rating) => rating.rapperId !== input.rapperId),
  ]);

  await writeLocalMockState({
    ...state,
    ratings: nextRatings,
  });

  return nextRating;
}
