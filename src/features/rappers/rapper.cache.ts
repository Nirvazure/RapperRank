import { unstable_cache } from "next/cache";
import {
  listAllRappers,
  listTopRappers,
} from "@/features/rappers/rapper.repository";

const REVALIDATE_SECONDS = 60;

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

export async function revalidateRapperPublicCache(topLimit = 10) {
  const { revalidateTag } = await import("next/cache");
  revalidateTag("rappers:all", "max");
  revalidateTag(`rappers:top:${topLimit}`, "max");
}
