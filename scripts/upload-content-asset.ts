import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { readFile, stat } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import sharp from "sharp";
import { assetManifestSchema } from "./content/assets";
import { probeAudio } from "./storage-migration/media";
import { safeError } from "./storage-migration/transport";
import { STORAGE_IMAGE_WIDTHS, storageImageVariantKey, storageObjectPublicUrl } from "../src/lib/storage-media";

loadEnvConfig(process.cwd());
const db = new PrismaClient();
const hash = (bytes: Buffer) => createHash("sha256").update(bytes).digest("hex");
async function main() {
  const args = process.argv.slice(2);
  const file = args.find((arg) => arg.startsWith("--file="))?.slice(7);
  if (!file) throw new Error("Usage: content:upload --file=reviewed-asset.json [--apply]. Uses a local file; never downloads platform media.");
  const asset = assetManifestSchema.parse(JSON.parse(await readFile(file, "utf8")));
  const localFile = path.resolve(path.dirname(file), asset.file);
  if ((await stat(localFile)).size > 100 * 1024 * 1024) throw new Error("Asset exceeds 100 MiB");
  const bytes = await readFile(localFile);
  if (hash(bytes) !== asset.sha256) throw new Error("File differs from the reviewed checksum");
  const owner = { [`${asset.owner}Id`]: asset.ownerId };
  const exists = asset.owner === "rapper" ? await db.rapper.findUnique({ where: { id: asset.ownerId } }) : asset.owner === "track" ? await db.track.findUnique({ where: { id: asset.ownerId } }) : await db.album.findUnique({ where: { id: asset.ownerId } });
  if (!exists) throw new Error("Unknown content owner");
  let mime: string, objectPath: string, width: number | null = null, height: number | null = null, durationSeconds: number | null = null;
  const objects: { key: string; bytes: Buffer; mime: string }[] = [];
  if (asset.kind === "image") {
    const metadata = await sharp(bytes).metadata();
    const formats: Record<string, { extension: string; mime: string }> = { jpeg: { extension: "jpg", mime: "image/jpeg" }, png: { extension: "png", mime: "image/png" }, webp: { extension: "webp", mime: "image/webp" } };
    const format = metadata.format && formats[metadata.format];
    if (!format || !metadata.width || !metadata.height || (metadata.pages ?? 1) > 1) throw new Error("Expected a static JPEG, PNG or WebP image");
    mime = format.mime; width = metadata.width; height = metadata.height;
    objectPath = `${asset.owner === "album" ? "album/art" : "rapper"}/${asset.id}-${asset.sha256.slice(0, 16)}.${format.extension}`;
    objects.push({ key: objectPath, bytes, mime });
    for (const size of STORAGE_IMAGE_WIDTHS) objects.push({ key: storageImageVariantKey(objectPath, size), bytes: await sharp(bytes).rotate().resize({ width: size, withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(), mime: "image/webp" });
  } else {
    if (bytes.subarray(4, 8).toString() !== "ftyp") throw new Error("Only MP4/AAC audio files are supported");
    const audio = await probeAudio(localFile);
    if (audio.codec !== "aac" || (asset.kind === "audio_preview" && audio.duration > 90.1)) throw new Error("Preview must be AAC and at most 90 seconds");
    mime = "audio/mp4"; durationSeconds = audio.duration;
    objectPath = `music/${asset.ownerId}-${asset.kind === "audio_full" ? "full" : "preview"}-${asset.sha256.slice(0, 16)}.m4a`;
    objects.push({ key: objectPath, bytes, mime });
  }
  const existing = await db.mediaAsset.findUnique({ where: { id: asset.id } });
  if (existing && (existing.sha256 !== asset.sha256 || existing.objectPath !== objectPath || existing.sourceId !== asset.source.id || existing.rapperId !== (asset.owner === "rapper" ? asset.ownerId : null) || existing.trackId !== (asset.owner === "track" ? asset.ownerId : null) || existing.albumId !== (asset.owner === "album" ? asset.ownerId : null))) throw new Error("Asset identity conflicts with an existing reviewed record");
  const reference = await db.contentSource.findUnique({ where: { id: asset.source.id } });
  if (reference && (reference.url !== asset.source.url || reference.reviewStatus !== "approved" || reference.rapperId !== (asset.owner === "rapper" ? asset.ownerId : null) || reference.trackId !== (asset.owner === "track" ? asset.ownerId : null) || reference.albumId !== (asset.owner === "album" ? asset.ownerId : null))) throw new Error("Source conflicts with a reviewed record");
  console.log(JSON.stringify({ apply: args.includes("--apply"), id: asset.id, objects: objects.map(({ key, mime }) => ({ key, mime })), durationSeconds }));
  if (!args.includes("--apply")) return;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is required on the server");
  const admin = createClient("https://tfvzcuksahcofooqqezx.supabase.co", key, { auth: { persistSession: false, autoRefreshToken: false } });
  for (const object of objects) {
    const response = await fetch(storageObjectPublicUrl(object.key), { signal: AbortSignal.timeout(30000) });
    if (response.ok) {
      if (hash(Buffer.from(await response.arrayBuffer())) !== hash(object.bytes)) throw new Error("Storage object conflict; refusing to overwrite");
    } else {
      const body = await response.text();
      if (response.status !== 404 && !(response.status === 400 && body.includes('"NoSuchKey"'))) throw new Error(`Cannot establish object absence (${response.status})`);
      const result = await admin.storage.from("rapperank").upload(object.key, object.bytes, { contentType: object.mime, upsert: false, cacheControl: "31536000" });
      if (result.error) throw result.error;
    }
    const verified = await fetch(storageObjectPublicUrl(object.key), { signal: AbortSignal.timeout(30000) });
    if (!verified.ok || verified.headers.get("content-type")?.split(";")[0] !== object.mime || hash(Buffer.from(await verified.arrayBuffer())) !== hash(object.bytes)) throw new Error("Public Storage checksum or MIME verification failed");
  }
  if (asset.kind.startsWith("audio")) {
    const range = await fetch(storageObjectPublicUrl(objectPath), { headers: { Range: "bytes=0-1023" }, signal: AbortSignal.timeout(30000) });
    if (range.status !== 206 || !range.headers.get("content-range")?.startsWith("bytes 0-")) throw new Error("Audio Range verification failed");
    await range.body?.cancel();
  }
  await db.$transaction(async (tx) => {
    await tx.contentSource.upsert({ where: { id: asset.source.id }, create: { ...asset.source, ...owner, fields: ["media", "rightsBasis"], reviewStatus: "approved" }, update: {} });
    await tx.mediaAsset.upsert({ where: { id: asset.id }, create: { id: asset.id, ...owner, sourceId: asset.source.id, kind: asset.kind, bucket: "rapperank", objectPath, mime, bytes: bytes.length, sha256: asset.sha256, width, height, durationSeconds, caption: asset.caption, attribution: asset.attribution, rightsBasis: asset.rightsBasis, redistributionAllowed: true, reviewStatus: "approved" }, update: {} });
    if (asset.kind.startsWith("audio")) await tx.playbackSource.upsert({ where: { id: `${asset.id}-playback` }, create: { id: `${asset.id}-playback`, trackId: asset.ownerId, provider: "storage", platformId: asset.id, storefront: "cn", kind: asset.kind === "audio_full" ? "audio_full" : "audio_preview", url: storageObjectPublicUrl(objectPath), durationSeconds: Math.round(durationSeconds!), conditions: asset.rightsBasis, reviewStatus: "approved", status: "pending", verificationNote: "Checksum, MIME, AAC duration and HTTP Range verified. Browser playback verification still required." }, update: {} });
  });
  console.log("Reviewed files stored and verified. Audio remains pending until actual playback evidence is applied.");
}
main().catch((error) => { console.error(safeError(error)); process.exitCode = 1; }).finally(() => db.$disconnect());
