import type { Rapper } from "@/features/rappers/rapper.types";

export const RAPPER_OSS_BASE_URL = "https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/";
export const NIRVAZURE_OSS_BASE_URL = "https://nirvazure-next.oss-cn-hangzhou.aliyuncs.com/";
export const RAPPER_IMAGE_PLACEHOLDER_LABEL = "No OSS Image";

/** OSS 已由 CDN 托管；跳过 Next 图片优化，避免服务端拉取国内 OSS 导致 504。 */
export function shouldBypassNextImageOptimization(src: string): boolean {
  return (
    src.startsWith(RAPPER_OSS_BASE_URL) ||
    src.startsWith(NIRVAZURE_OSS_BASE_URL) ||
    src.startsWith("https://rapperank.oss-cn-hangzhou.aliyuncs.com/label/")
  );
}

function isRapperankOssUrl(url: string): boolean {
  return (
    url.startsWith(RAPPER_OSS_BASE_URL) ||
    url.startsWith("https://rapperank.oss-cn-hangzhou.aliyuncs.com/label/")
  );
}

/** 为 OSS 图片追加 resize/quality 参数，降低首屏传输体积。非 OSS URL 原样返回。 */
export function optimizeOssImageUrl(url: string, { width = 1200 }: { width?: number } = {}): string {
  if (!isRapperankOssUrl(url)) {
    return url;
  }

  const processParam = `image/resize,w_${width}/quality,q_85`;
  if (url.includes("x-oss-process=")) {
    return url;
  }

  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}x-oss-process=${processParam}`;
}

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
