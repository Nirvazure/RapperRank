import { RankPageView } from "@/features/rappers/RankPageView";

export default async function RankPage({
  params,
}: {
  params: Promise<{ rapperId: string }>;
}) {
  const { rapperId } = await params;
  return <RankPageView rapperId={rapperId} />;
}
