import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { findFavorite } from "@/features/favorites/favorite.repository";
import { mapRapperRecordToViewModel, mapRatingRecordToUserRating } from "@/features/rappers/rapper.mapper";
import { getCachedRapperBySlug } from "@/features/rappers/rapper.cache";
import { findRating } from "@/features/ratings/rating.repository";
import { resolvePageViewer } from "@/lib/server/viewer";

export async function RankPageView({ slug }: { slug: string }) {
  const [viewer, record] = await Promise.all([
    resolvePageViewer(),
    getCachedRapperBySlug(slug),
  ]);

  if (!record) {
    notFound();
  }

  const [favorite, rating] = viewer.userId
    ? await Promise.all([
        findFavorite({ userId: viewer.userId, rapperId: record.id }),
        findRating({ userId: viewer.userId, rapperId: record.id }),
      ])
    : [null, null];

  return (
    <AppShell
      rapper={mapRapperRecordToViewModel(record)}
      isFavorite={Boolean(favorite)}
      myRating={rating ? mapRatingRecordToUserRating(rating) : null}
      viewer={viewer}
    />
  );
}
