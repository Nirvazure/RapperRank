import type { Rapper } from "@/features/rappers/rapper.types";

export const RAPPER_OSS_BASE_URL = "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/";
export const RAPPER_IMAGE_PLACEHOLDER_LABEL = "No OSS Image";

export type ResolvedRapperImage = {
  src?: string;
  alt: string;
  isPlaceholder: boolean;
};

export function resolveRapperMedia(rapper: Pick<Rapper, "name" | "mediaUrl">): ResolvedRapperImage {
  return {
    src: rapper.mediaUrl,
    alt: `${rapper.name} visual`,
    isPlaceholder: !rapper.mediaUrl,
  };
}

export function normalizeRapperImageUrl(url?: string): string | undefined {
  if (!url) {
    return undefined;
  }

  if (url.startsWith(RAPPER_OSS_BASE_URL)) {
    return url;
  }

  if (!url.startsWith("/rapper/")) {
    return undefined;
  }

  return `${RAPPER_OSS_BASE_URL}${url.slice("/rapper/".length)}`;
}

export function normalizeRapperImages(rapper: Rapper): Rapper {
  return {
    ...rapper,
    avatarUrl: normalizeRapperImageUrl(rapper.avatarUrl),
    mediaUrl: normalizeRapperImageUrl(rapper.mediaUrl),
  };
}

export function resolveRapperAvatar(
  rapper: Pick<Rapper, "name" | "avatarUrl" | "mediaUrl">,
): ResolvedRapperImage {
  const src = rapper.avatarUrl ?? rapper.mediaUrl;

  return {
    src,
    alt: rapper.name,
    isPlaceholder: !src,
  };
}
