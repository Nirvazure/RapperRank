import type { RapperSeedRecord } from "@/features/rappers/rapper.types";
import { normalizeRapperImageUrl } from "@/features/rappers/rapper.media";

const PLACEHOLDER_BIO = "资料待补充。";
const PLACEHOLDER_WORK = "代表作品待补充";

function sanitizeText(value: string | undefined, fallback: string) {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed || trimmed.includes("???") || trimmed.includes("锛") || trimmed.includes("銆")) {
    return fallback;
  }

  return trimmed;
}

export function cleanSeedRapper(rapper: RapperSeedRecord): RapperSeedRecord {
  return {
    ...rapper,
    aliases: rapper.aliases ?? [],
    avatarUrl: normalizeRapperImageUrl(rapper.avatarUrl),
    mediaUrl: normalizeRapperImageUrl(rapper.mediaUrl),
    bio: sanitizeText(rapper.bio, PLACEHOLDER_BIO),
    representativeWorks:
      rapper.representativeWorks.length > 0 &&
      rapper.representativeWorks.every((work) => work.trim() && !work.includes("???"))
        ? rapper.representativeWorks
        : [PLACEHOLDER_WORK],
  };
}
