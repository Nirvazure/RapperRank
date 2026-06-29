import { getViewer } from "@/lib/server/viewer";
import { ok } from "@/lib/server/response";
import { getViewerFavorites, getViewerRatings } from "@/features/user/user.server";

export async function GET() {
  const viewer = await getViewer();
  const [favorites, ratings] = await Promise.all([
    getViewerFavorites(viewer.userId),
    getViewerRatings(viewer.userId),
  ]);

  return ok({
    user: {
      displayName: viewer.displayName,
      avatarUrl: viewer.avatarUrl,
      isAuthenticated: viewer.isAuthenticated,
      favoritesCount: favorites.length,
      ratingsCount: ratings.length,
    },
  });
}
