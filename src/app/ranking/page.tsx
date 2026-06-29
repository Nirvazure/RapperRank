import { RankingPageClient } from "@/components/ranking/RankingPageClient";
import { getViewer } from "@/lib/server/viewer";
import { getRankingPageData } from "@/features/rappers/rapper.server";
import { getViewerFavorites, getViewerRatings } from "@/features/user/user.server";

export const dynamic = "force-dynamic";

export default async function RankingPage() {
  const viewer = await getViewer();
  const [rankingData, favorites, ratings] = await Promise.all([
    getRankingPageData(),
    getViewerFavorites(viewer.userId),
    getViewerRatings(viewer.userId),
  ]);

  return (
    <RankingPageClient
      rappers={rankingData.rappers}
      ranking={rankingData.ranking}
      favoriteIds={favorites.map((item) => item.id)}
      ratings={ratings}
      viewer={viewer}
    />
  );
}
