import { AppShell } from "@/components/layout/AppShell";
import { getViewer } from "@/lib/server/viewer";
import { getRapperPageData } from "@/features/rappers/rapper.server";

export const dynamic = "force-dynamic";

export default async function RankPage({
  params,
}: {
  params: Promise<{ rapperId: string }>;
}) {
  const { rapperId } = await params;
  const viewer = await getViewer();
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
