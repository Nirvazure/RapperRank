import { FavoritesPageClient } from "@/components/favorites/FavoritesPageClient";
import { resolvePageViewer } from "@/lib/server/viewer";
import { getViewerFavorites, getViewerRatings } from "@/features/user/user.server";
import { getCachedAllRappers } from "@/features/rappers/rapper.cache";
import { mapRapperRecordToViewModel } from "@/features/rappers/rapper.mapper";

export default async function FavoritesPage() {
  const viewer = await resolvePageViewer();
  const rappers = await getCachedAllRappers();
  const [favorites, ratings] = viewer.userId
    ? await Promise.all([
        getViewerFavorites(viewer.userId),
        getViewerRatings(viewer.userId),
      ])
    : [[], []];

  return (
    <FavoritesPageClient
      favoriteRappers={favorites}
      ratings={ratings}
      allRappers={rappers.map(mapRapperRecordToViewModel)}
      viewer={viewer}
    />
  );
}
