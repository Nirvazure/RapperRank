import { AppShell } from "@/components/layout/AppShell";
import { getRapperPageData } from "@/features/rappers/rapper.server";
import { resolvePageViewer } from "@/lib/server/viewer";

export async function RankPageView({ rapperId }: { rapperId: string }) {
  const viewer = await resolvePageViewer();
  const data = await getRapperPageData(rapperId, viewer.userId);

  return (
    <AppShell
      rapper={data.rapper}
      isFavorite={data.isFavorite}
      myRating={data.myRating}
      viewer={viewer}
    />
  );
}
