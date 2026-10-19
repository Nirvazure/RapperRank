import { createHash } from "node:crypto";

/** Bind the deployed reader and its URL mapping to the migration's verified output. */
export function storageVersion(mapping: Readonly<Record<string, string>>) {
  const sorted = Object.fromEntries(Object.entries(mapping).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0));
  return {
    schema: 2,
    bucket: "rapperank",
    mappingSha256: createHash("sha256").update(JSON.stringify(sorted)).digest("hex"),
    imageRecipe: "readable-thumbs-webp-v2",
    audioRecipe: "music-preview-30-45-fade-0.2-v2",
  } as const;
}
