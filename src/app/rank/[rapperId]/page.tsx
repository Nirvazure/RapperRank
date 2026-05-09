import { AppShell } from "@/components/layout/AppShell";

export default async function RankPage({
  params,
}: {
  params: Promise<{ rapperId: string }>;
}) {
  const { rapperId } = await params;

  return <AppShell initialRapperId={rapperId} />;
}
