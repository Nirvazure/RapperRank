import { FavoritesPageClient } from "@/components/favorites/FavoritesPageClient";
import { getAnonymousViewer } from "@/lib/server/auth-anonymous";
import { getViewerFavorites, getViewerRatings } from "@/features/user/user.server";
import { listAllRappers } from "@/features/rappers/rapper.repository";
import { mapRapperRecordToViewModel } from "@/features/rappers/rapper.mapper";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const viewer = await getAnonymousViewer();
  const [favorites, ratings, rappers] = await Promise.all([
    getViewerFavorites(viewer.userId),
    getViewerRatings(viewer.userId),
    listAllRappers(),
  ]);

  return (
    <FavoritesPageClient
      favoriteRappers={favorites}
      ratings={ratings}
      allRappers={rappers.map(mapRapperRecordToViewModel)}
      viewerDisplayName="匿名用户"
    />
  );
}
