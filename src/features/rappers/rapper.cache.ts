import { unstable_cache } from "next/cache";
import {
  findRapperById,
  listAllRappers,
  listTopRappers,
} from "@/features/rappers/rapper.repository";

const REVALIDATE_SECONDS = 60;

export function getCachedRapperById(id: string) {
  return unstable_cache(
    async () => findRapperById(id),
    [`rapper-by-id:${id}`],
    { revalidate: REVALIDATE_SECONDS, tags: [`rapper:${id}`] },
  )();
}

export function getCachedAllRappers() {
  return unstable_cache(
    async () => listAllRappers(),
    ["rappers-all"],
    { revalidate: REVALIDATE_SECONDS, tags: ["rappers:all"] },
  )();
}

export function getCachedTopRappers(limit: number) {
  return unstable_cache(
    async () => listTopRappers(limit),
    [`rappers-top:${limit}`],
    { revalidate: REVALIDATE_SECONDS, tags: [`rappers:top:${limit}`] },
  )();
}

export async function revalidateRapperPublicCache(rapperId: string, topLimit = 10) {
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`rapper:${rapperId}`, "max");
  revalidateTag("rappers:all", "max");
  revalidateTag(`rappers:top:${topLimit}`, "max");
}
