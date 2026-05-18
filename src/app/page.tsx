import { redirect } from "next/navigation";
import { getRandomRapperSlugFromDb } from "@/features/rappers/rapper.server";

export const dynamic = "force-dynamic";

export default async function Home() {
  const slug = await getRandomRapperSlugFromDb();
  redirect(`/rank/${slug}`);
}
