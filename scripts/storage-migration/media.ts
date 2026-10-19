import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import sharp from "sharp";
import { STORAGE_IMAGE_WIDTHS, storageImageVariantKey } from "../../src/lib/storage-media";
import { assertTargetKey, isPreviewDuration, sha256, type Asset, type StoredObject } from "./core";

const EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif",
  "audio/mpeg": "mp3", "audio/mp4": "m4a", "audio/aac": "aac", "audio/wav": "wav", "audio/ogg": "ogg",
};
export type AudioInfo = { duration: number; codec: string };
export type ProcessRunner = (executable: string, args: string[]) => Promise<string>;

export const runProcess: ProcessRunner = (executable, args) => new Promise((resolve, reject) => {
  const child = spawn(executable, args, { shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"], timeout: 120_000 });
  const output: Buffer[] = [];
  const errors: Buffer[] = [];
  child.stdout.on("data", (chunk: Buffer) => output.push(chunk));
  child.stderr.on("data", (chunk: Buffer) => errors.push(chunk));
  child.on("error", reject);
  child.on("close", (code) => {
    if (code === 0) resolve(Buffer.concat(output).toString("utf8"));
    else reject(new Error(`Media command failed (${code ?? "terminated"}): ${Buffer.concat(errors).toString("utf8").slice(-1500)}`));
  });
});

export function binaryPath(kind: "ffmpeg" | "ffprobe"): string {
  const override = process.env[kind === "ffmpeg" ? "FFMPEG_PATH" : "FFPROBE_PATH"];
  if (override) return override;
  const require = createRequire(import.meta.url);
  const packageJson = require.resolve(`@${kind}-installer/win32-x64/package.json`);
  return path.join(path.dirname(packageJson), `${kind}.exe`);
}

export async function probeAudio(file: string, run: ProcessRunner = runProcess, executable = binaryPath("ffprobe")): Promise<AudioInfo> {
  const output = await run(executable, ["-v", "error", "-select_streams", "a:0", "-show_entries", "stream=codec_name,duration:format=duration", "-of", "json", file]);
  const parsed = JSON.parse(output) as { streams?: Array<{ codec_name?: string; duration?: string }>; format?: { duration?: string } };
  const stream = parsed.streams?.[0];
  const duration = Number(parsed.format?.duration ?? stream?.duration);
  if (!stream?.codec_name || !Number.isFinite(duration) || duration <= 0) throw new Error("Audio probe returned no valid audio stream/duration");
  return { duration, codec: stream.codec_name };
}

export function audioPreviewArgs(source: string, target: string): string[] {
  return ["-nostdin", "-hide_banner", "-loglevel", "error", "-y", "-ss", "30", "-i", source, "-t", "15", "-map", "0:a:0", "-vn", "-af", "afade=t=in:st=0:d=0.2,afade=t=out:st=14.8:d=0.2", "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2", "-map_metadata", "-1", "-movflags", "+faststart", target];
}

export async function makeAudioPreview(source: string, target: string, dependencies: { probe?: (file: string) => Promise<AudioInfo>; run?: ProcessRunner; executable?: string } = {}): Promise<{ original: AudioInfo; preview: AudioInfo }> {
  const probe = dependencies.probe ?? probeAudio;
  const original = await probe(source);
  if (original.duration < 45) throw new Error(`Audio is shorter than the required 45 seconds (${original.duration}s)`);
  await (dependencies.run ?? runProcess)(dependencies.executable ?? binaryPath("ffmpeg"), audioPreviewArgs(source, target));
  const preview = await probe(target);
  if (!isPreviewDuration(preview.duration) || preview.codec !== "aac") throw new Error("Audio preview must be AAC and 15 seconds (±0.1s)");
  return { original, preview };
}

export async function saveArtifact(runDir: string, key: string, bytes: Buffer, metadata: Pick<StoredObject, "mime" | "role"> & Partial<Pick<StoredObject, "width" | "duration" | "codec">>): Promise<StoredObject> {
  const file = path.posix.join("objects", key);
  const destination = artifactPath(runDir, file);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  return { key, file, sha256: sha256(bytes), bytes: bytes.length, ...metadata };
}

export function artifactPath(runDir: string, file: string): string {
  const base = path.resolve(runDir);
  const resolved = path.resolve(base, file);
  if (!resolved.startsWith(`${base}${path.sep}`)) throw new Error("Artifact path escapes migration run");
  return resolved;
}

export async function generateArtifacts(runDir: string, asset: Asset, bytes: Buffer): Promise<StoredObject[]> {
  if (!asset.version) throw new Error("Asset has no planned source version");
  const mime = asset.version.mime;
  assertTargetKey(asset);
  const extension = EXTENSIONS[mime];
  if (!extension || !mime.startsWith(`${asset.kind}/`)) throw new Error(`Unsupported ${asset.kind} MIME: ${mime}`);
  const hash = sha256(bytes);
  if (asset.kind === "image") {
    const original = await saveArtifact(runDir, asset.targetKey, bytes, { mime, role: "original" });
    const objects = [original];
    for (const width of STORAGE_IMAGE_WIDTHS) {
      const variant = await sharp(bytes).rotate().resize({ width, withoutEnlargement: true, fit: "inside" }).webp({ quality: 85 }).toBuffer();
      objects.push(await saveArtifact(runDir, storageImageVariantKey(asset.targetKey, width), variant, { mime: "image/webp", role: "image-variant", width }));
    }
    return objects;
  }
  const sourceFile = path.posix.join("sources", "audio", `${hash}.${extension}`);
  const localSource = artifactPath(runDir, sourceFile);
  await mkdir(path.dirname(localSource), { recursive: true });
  await writeFile(localSource, bytes);
  const previewKey = asset.targetKey;
  const previewFile = artifactPath(runDir, path.posix.join("objects", previewKey));
  await mkdir(path.dirname(previewFile), { recursive: true });
  const info = await makeAudioPreview(localSource, previewFile);
  asset.sourceFile = sourceFile;
  asset.sourceBytes = bytes.length;
  asset.sourceMime = mime;
  asset.sourceDuration = info.original.duration;
  asset.sourceCodec = info.original.codec;
  const preview = await saveArtifact(runDir, previewKey, await readFile(previewFile), { mime: "audio/mp4", role: "audio-preview", ...info.preview });
  // Deliberately omit original from the object list: source audio remains local evidence only.
  return [preview];
}

export async function readArtifact(runDir: string, object: StoredObject): Promise<Buffer> {
  const bytes = await readFile(artifactPath(runDir, object.file));
  if (bytes.length !== object.bytes || sha256(bytes) !== object.sha256) throw new Error(`Local artifact hash mismatch: ${object.key}`);
  return bytes;
}
