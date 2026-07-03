import { RankPageView } from "@/features/rappers/RankPageView";
import { pickRandomRapperSlug } from "@/features/rappers/rapper.repository";

export default async function Home() {
  const slug = await pickRandomRapperSlug();
  return <RankPageView slug={slug} />;
}
