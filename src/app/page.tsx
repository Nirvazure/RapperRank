import { RankPageView } from "@/features/rappers/RankPageView";
import { pickRandomRapperId } from "@/features/rappers/rapper.repository";
import { notFound } from "next/navigation";

export default async function Home() {
  const rapperId = await pickRandomRapperId();
  if (!rapperId) {
    notFound();
  }

  return <RankPageView rapperId={rapperId} />;
}
