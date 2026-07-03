import { unstable_cache } from "next/cache";
import {
  findRapperBySlug,
  listAllRappers,
  listTopRappers,
} from "@/features/rappers/rapper.repository";

const REVALIDATE_SECONDS = 60;

export function getCachedRapperBySlug(slug: string) {
  return unstable_cache(
    async () => findRapperBySlug(slug),
    [`rapper-by-slug:${slug}`],
    { revalidate: REVALIDATE_SECONDS, tags: [`rapper:${slug}`] },
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

export async function revalidateRapperPublicCache(slug: string, topLimit = 10) {
  const { revalidateTag } = await import("next/cache");
  revalidateTag(`rapper:${slug}`, "max");
  revalidateTag("rappers:all", "max");
  revalidateTag(`rappers:top:${topLimit}`, "max");
}
