import { getAnonymousViewer } from "@/lib/server/auth-anonymous";
import { ok } from "@/lib/server/response";
import { getViewerFavorites, getViewerRatings } from "@/features/user/user.server";

export async function GET() {
  const viewer = await getAnonymousViewer();
  const [favorites, ratings] = await Promise.all([
    getViewerFavorites(viewer.userId),
    getViewerRatings(viewer.userId),
  ]);

  return ok({
    user: {
      displayName: "匿名用户",
      favoritesCount: favorites.length,
      ratingsCount: ratings.length,
    },
  });
}
