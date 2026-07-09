import { FavoritesPageClient } from "@/components/favorites/FavoritesPageClient";
import { resolvePageViewer } from "@/lib/server/viewer";
import { getViewerFavorites, getViewerRatingsPage } from "@/features/user/user.server";

export default async function FavoritesPage() {
  const viewer = await resolvePageViewer();
  const [favorites, ratingsPage] = viewer.userId
    ? await Promise.all([
      getViewerFavorites(viewer.userId),
      getViewerRatingsPage(viewer.userId),
    ])
    : [
      [],
      {
        items: [],
        page: 1,
        pageSize: 6,
        total: 0,
        totalPages: 1,
      },
    ];

  return (
    <FavoritesPageClient
      favoriteRappers={favorites}
      ratingsPage={ratingsPage}
      viewer={viewer}
    />
  );
}
