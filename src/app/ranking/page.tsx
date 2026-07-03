import { RankingPageClient } from "@/components/ranking/RankingPageClient";
import { resolvePageViewer } from "@/lib/server/viewer";
import { getRankingPageData } from "@/features/rappers/rapper.server";
import { getViewerFavorites, getViewerRatings } from "@/features/user/user.server";

export default async function RankingPage() {
  const viewer = await resolvePageViewer();
  const rankingData = await getRankingPageData();
  const [favorites, ratings] = viewer.userId
    ? await Promise.all([
        getViewerFavorites(viewer.userId),
        getViewerRatings(viewer.userId),
      ])
    : [[], []];

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
