"use client";

import Image, { type ImageLoaderProps, type ImageProps } from "next/image";
import {
  getStorageImageUrl,
  isStorageImageUrl,
  resolveStorageAssetUrl,
} from "@/lib/storage-media";
import { shouldBypassNextImageOptimization } from "@/features/rappers/rapper.media";

function storageLoader({ src, width }: ImageLoaderProps): string {
  return getStorageImageUrl(src, width);
}

/** Only managed Supabase images use the pre-generated variants. */
export function StorageImage({ src, alt, unoptimized, ...props }: ImageProps) {
  const resolved = typeof src === "string" ? resolveStorageAssetUrl(src) : src;
  const managed = typeof resolved === "string" && isStorageImageUrl(resolved);
  return (
    <Image
      {...props}
      src={resolved}
      alt={alt}
      loader={managed ? storageLoader : undefined}
      unoptimized={managed ? false : (unoptimized ?? (typeof resolved === "string" && shouldBypassNextImageOptimization(resolved)))}
    />
  );
}
