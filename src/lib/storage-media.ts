import assetMapping from "@/data/storage-assets.json";

export const STORAGE_PUBLIC_BASE_URL =
  "https://tfvzcuksahcofooqqezx.supabase.co/storage/v1/object/public/rapperank";
export const STORAGE_IMAGE_WIDTHS = [128, 320, 800, 1200] as const;

const ossHosts = new Set([
  "rapperank.oss-cn-hangzhou.aliyuncs.com",
  "nirvazure-next.oss-cn-hangzhou.aliyuncs.com",
]);
const migratedAssets: Readonly<Record<string, string>> = assetMapping;

export function canonicalizeOssUrl(value: string): string {
  // WHATWG URLs trim trailing spaces; encode path spaces before parsing source keys.
  const url = new URL(value.replace(/ /g, "%20"));
  if (url.protocol !== "https:" || !ossHosts.has(url.hostname) || url.port || url.username || url.password) {
    throw new Error("Unsupported OSS source URL");
  }
  url.searchParams.delete("x-oss-process");
  url.hash = "";
  return url.href;
}

export function resolveStorageAssetUrl(src: string): string {
  let canonical: string;
  try {
    canonical = canonicalizeOssUrl(src);
  } catch {
    return src;
  }
  return migratedAssets[canonical] ?? src;
}

export function storageObjectPublicUrl(key: string): string {
  return `${STORAGE_PUBLIC_BASE_URL}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

export function storageImageVariantKey(originalKey: string, width: number): string {
  const slash = originalKey.lastIndexOf("/");
  const folder = originalKey.slice(0, slash);
  const stem = originalKey.slice(slash + 1).replace(/\.[^.]+$/, "");
  return `${folder}/thumbs/${stem}-w${width}.webp`;
}

function storageImageKey(src: string): string | undefined {
  const prefix = `${STORAGE_PUBLIC_BASE_URL}/`;
  if (!src.startsWith(prefix)) return undefined;
  let key: string;
  try { key = src.slice(prefix.length).split("/").map(decodeURIComponent).join("/"); }
  catch { return undefined; }
  return /^(?:rapper|label|album\/art)\/[^/?#]+\.(?:jpg|jpeg|png|webp)$/.test(key) ? key : undefined;
}

export function isStorageImageUrl(src: string): boolean {
  return storageImageKey(src) !== undefined;
}

export function getStorageImageUrl(src: string, width: number): string {
  const resolved = resolveStorageAssetUrl(src);
  const key = storageImageKey(resolved);
  if (!key) return resolved;
  const selected = STORAGE_IMAGE_WIDTHS.find((candidate) => candidate >= width) ?? 1200;
  return storageObjectPublicUrl(storageImageVariantKey(key, selected));
}
