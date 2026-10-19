import { createHash } from "node:crypto";
import { canonicalizeOssUrl, storageObjectPublicUrl, storageImageVariantKey } from "../../src/lib/storage-media";

export const MEDIA_FIELDS = ["avatarUrl", "mediaUrl", "backgroundAudioUrl"] as const;
export type MediaField = (typeof MEDIA_FIELDS)[number];
export type RowSnapshot = { id: string } & Record<MediaField, string | null>;
export type Binding = { kind: "database"; id: string; field: MediaField } | { kind: "static"; id: string; field: string };
export type SourceVersion = { etag: string | null; lastModified: string | null; bytes: number; mime: string };
export type StoredObject = {
  key: string; sha256: string; bytes: number; mime: string; file: string;
  role: "original" | "image-variant" | "audio-preview";
  width?: number; duration?: number; codec?: string;
};
export type Asset = {
  source: string; kind: "image" | "audio"; bindings: Binding[]; version?: SourceVersion;
  state: "planned" | "copied" | "failed"; error?: string; sourceSha256?: string;
  objects: StoredObject[]; target?: string;
  targetKey?: string;
  /** Audio originals are retained only in the local run evidence; they are never uploaded. */
  sourceFile?: string; sourceBytes?: number; sourceMime?: string; sourceDuration?: number; sourceCodec?: string;
};
export type Verification = { key: string; sha256: string; bytes: number; mime: string; duration?: number; codec?: string; range?: true };
export type Manifest = {
  format: 2; runId: string; createdAt: string; snapshot: RowSnapshot[]; assets: Asset[];
  verification?: { at: string; full: boolean; digest: string; objects: Verification[] };
  deployment?: { url: string; id: string; suppliedAt: string; verifiedAt?: string; mappingSha256?: string };
  appliedAt?: string;
};
export type StaticReference = { id: string; field: string; url: string | null | undefined };

export function sha256(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function normalizeMime(value: string | null): string {
  const mime = (value ?? "").split(";", 1)[0].trim().toLowerCase();
  return ({ "image/jpg": "image/jpeg", "audio/x-m4a": "audio/mp4", "audio/m4a": "audio/mp4", "audio/x-mp3": "audio/mpeg", "audio/mp3": "audio/mpeg" } as Record<string, string>)[mime] ?? mime;
}

export function inventory(rows: RowSnapshot[], staticReferences: StaticReference[], mapping: Record<string, string> = {}): Pick<Manifest, "snapshot" | "assets"> {
  const reverse = new Map(Object.entries(mapping).map(([source, target]) => [target, source]));
  const assets = new Map<string, Asset>();
  const add = (value: string | null | undefined, binding: Binding, kind: Asset["kind"]) => {
    if (!value || value.startsWith("/") || value.startsWith("data:")) return;
    const source = canonicalizeOssUrl(reverse.get(value) ?? value);
    let asset = assets.get(source);
    if (!asset) {
      asset = { source, kind, bindings: [], state: "planned", objects: [] };
      assets.set(source, asset);
    }
    if (asset.kind !== kind) throw new Error(`Conflicting asset roles: ${source}`);
    asset.bindings.push(binding);
  };
  for (const row of rows) for (const field of MEDIA_FIELDS) {
    add(row[field], { kind: "database", id: row.id, field }, field === "backgroundAudioUrl" ? "audio" : "image");
  }
  for (const ref of staticReferences) add(ref.url, { kind: "static", id: ref.id, field: ref.field }, "image");
  return {
    snapshot: rows.map((row) => ({ id: row.id, avatarUrl: row.avatarUrl, mediaUrl: row.mediaUrl, backgroundAudioUrl: row.backgroundAudioUrl })).sort((a, b) => a.id.localeCompare(b.id)),
    assets: [...assets.values()].sort((a, b) => a.source.localeCompare(b.source)),
  };
}

export function assertSameVersion(expected: SourceVersion, actual: SourceVersion): void {
  if (expected.etag !== actual.etag || expected.lastModified !== actual.lastModified || expected.bytes !== actual.bytes || expected.mime !== actual.mime) {
    throw new Error("OSS source changed since plan; create a new plan");
  }
}

export function publicUrl(key: string): string {
  return storageObjectPublicUrl(key);
}

export function assertTargetKey(asset: Pick<Asset, "kind" | "targetKey" | "source" | "version">): asserts asset is typeof asset & { targetKey: string } {
  const key = asset.targetKey;
  if (!key || key.length > 500 || !/^[A-Za-z0-9_(). /-]+$/.test(key) || key.split("/").some((part) => !part || part === "." || part === ".." || part !== part.trim() || part.endsWith("."))) throw new Error(`Invalid readable target key: ${key ?? asset.source}`);
  if (asset.kind === "audio") {
    if (!/^music\/[A-Za-z0-9_(). -]+\.m4a$/.test(key)) throw new Error("Audio targets must be readable music/*.m4a previews");
  } else {
    if (!/^(?:rapper|label)\/[A-Za-z0-9_(). -]+\.(?:jpg|jpeg|png|webp|gif|avif)$/.test(key) && !/^album\/art\/album \([1-9][0-9]*\)\.jpg$/.test(key)) throw new Error("Image target must be rapper/*, label/*, or album/art/album (N).jpg");
    const sourceExt = /\.([a-z0-9]+)$/i.exec(new URL(asset.source).pathname)?.[1].toLowerCase();
    const targetExt = key.slice(key.lastIndexOf(".") + 1);
    if (sourceExt && sourceExt !== targetExt) throw new Error(`Image source extension must be preserved: ${asset.source}`);
    const mimeExts: Record<string, string[]> = { "image/jpeg": ["jpg", "jpeg"], "image/png": ["png"], "image/webp": ["webp"], "image/gif": ["gif"], "image/avif": ["avif"] };
    if (asset.version && !mimeExts[asset.version.mime]?.includes(targetExt)) throw new Error(`Target extension does not match image MIME: ${key}`);
  }
}

export function assignTargetKeys(assets: Asset[], names: Readonly<Record<string, string>>): void {
  const keys = new Map<string, string>();
  for (const asset of assets) {
    asset.targetKey = names[asset.source];
    assertTargetKey(asset);
    const objects = asset.kind === "audio" ? [asset.targetKey] : [asset.targetKey, ...[128, 320, 800, 1200].map((width) => storageImageVariantKey(asset.targetKey!, width))];
    for (const key of objects) {
      // Windows local evidence and storage names must agree even for case collisions.
      const folded = key.toLowerCase();
      if (keys.has(folded)) throw new Error(`Target key conflict: ${key} (${keys.get(folded)} and ${asset.source})`);
      keys.set(folded, asset.source);
    }
  }
}

/** The sample covers source names, formats, and the largest audio transfer. */
export function selectAssets(assets: Asset[], sample: boolean): Asset[] {
  if (!sample) return assets;
  const selected = new Set<Asset>();
  const choose = (test: (asset: Asset) => boolean) => { const found = assets.find(test); if (found) selected.add(found); };
  choose((asset) => /[\u3400-\u9fff]/u.test(decodeURIComponent(new URL(asset.source).pathname)));
  choose((asset) => decodeURIComponent(new URL(asset.source).pathname).includes(" "));
  for (const mime of ["image/jpeg", "image/webp", "image/png", "audio/mp4"]) choose((asset) => asset.version?.mime === mime);
  const mp3 = assets.filter((asset) => asset.version?.mime === "audio/mpeg").sort((a, b) => (b.version?.bytes ?? 0) - (a.version?.bytes ?? 0))[0];
  if (mp3) selected.add(mp3);
  return [...selected];
}

export function exportMapping(manifest: Manifest): Record<string, string> {
  assertFullyVerified(manifest);
  return Object.fromEntries([...manifest.assets].sort((a, b) => a.source.localeCompare(b.source)).map((asset) => [asset.source, asset.target!]));
}

// Bind verification to every source version, nullable DB reference, transform and object.
// This detects stale evidence after a resume or manifest edit, rather than trusting a boolean.
export function evidenceDigest(manifest: Manifest): string {
  return sha256(JSON.stringify({ format: manifest.format, snapshot: manifest.snapshot, assets: manifest.assets.map(({ source, kind, version, bindings, sourceSha256, sourceFile, sourceBytes, sourceMime, sourceDuration, sourceCodec, objects, target, targetKey }) => ({ source, kind, version, bindings, sourceSha256, sourceFile, sourceBytes, sourceMime, sourceDuration, sourceCodec, objects, target, targetKey })) }));
}

export function assertFullyVerified(manifest: Manifest): void {
  if (manifest.format !== 2) throw new Error("Unsupported migration manifest; create a new readable-path plan");
  const verification = manifest.verification;
  if (!manifest.assets.length || manifest.assets.some((asset) => asset.state !== "copied" || !asset.target || !asset.sourceSha256 || !asset.objects.length)) throw new Error("Every planned asset must be copied before apply/export");
  for (const asset of manifest.assets) assertCompleteAsset(asset);
  if (!verification?.full || verification.digest !== evidenceDigest(manifest)) throw new Error("Full, current verification is required before apply/export");
  const expected = new Map(manifest.assets.flatMap((asset) => asset.objects).map((object) => [object.key, object]));
  const actual = new Map(verification.objects.map((object) => [object.key, object]));
  if (expected.size !== actual.size) throw new Error("Verification object set is incomplete");
  for (const [key, object] of expected) {
    const record = actual.get(key);
    if (!record || record.sha256 !== object.sha256 || record.bytes !== object.bytes || record.mime !== object.mime) throw new Error(`Missing or stale verification: ${key}`);
    if (object.role === "audio-preview" && (!record.range || record.codec !== "aac" || !isPreviewDuration(record.duration))) throw new Error(`Incomplete audio verification: ${key}`);
  }
}

export function assertCompleteAsset(asset: Asset): void {
  assertTargetKey(asset);
  if (!asset.sourceSha256 || !/^[a-f0-9]{64}$/.test(asset.sourceSha256)) throw new Error("Asset source SHA-256 is missing or invalid");
  const original = asset.objects.filter((object) => object.role === "original");
  if (new Set(asset.objects.map((object) => object.key)).size !== asset.objects.length || asset.objects.some((object) => !/^[a-f0-9]{64}$/.test(object.sha256) || object.bytes <= 0)) throw new Error("Invalid or duplicate object evidence");
  const target = asset.objects.find((object) => object.role === (asset.kind === "audio" ? "audio-preview" : "original"));
  if (!target || target.key !== asset.targetKey || asset.target !== publicUrl(asset.targetKey)) throw new Error("Asset target does not match its verified recipe");
  if (asset.kind === "image") {
    if (original.length !== 1 || original[0].sha256 !== asset.sourceSha256 || original[0].bytes !== asset.version?.bytes || original[0].mime !== asset.version?.mime) throw new Error(`Missing original source evidence: ${asset.source}`);
    if (original[0].key !== asset.targetKey) throw new Error("Original key differs from planned readable target");
    if (asset.objects.length !== 5) throw new Error("Image requires its original and all four WebP variants");
    for (const width of [128, 320, 800, 1200]) {
      const variant = asset.objects.find((object) => object.width === width && object.role === "image-variant");
      if (!variant || variant.key !== storageImageVariantKey(asset.targetKey, width) || variant.mime !== "image/webp") throw new Error(`Missing image variant: ${width}`);
    }
  } else {
    if (original.length !== 0 || asset.objects.length !== 1 || !asset.sourceFile || !new RegExp(`^sources/audio/${asset.sourceSha256}\\.[a-z0-9]+$`).test(asset.sourceFile) || asset.sourceBytes !== asset.version?.bytes || asset.sourceMime !== asset.version?.mime || !asset.sourceDuration || asset.sourceDuration < 45 || !asset.sourceCodec || target.mime !== "audio/mp4" || target.codec !== "aac" || !isPreviewDuration(target.duration)) throw new Error("Audio requires local original evidence and the approved 15 second AAC preview; full audio is never uploaded");
  }
}

export function isPreviewDuration(duration: number | undefined): boolean {
  return duration !== undefined && Number.isFinite(duration) && Math.abs(duration - 15) <= 0.1;
}

/** Check all IDs and all nullable references before producing any conditional updates. */
export function prepareUpdates(manifest: Manifest, current: RowSnapshot[]): Array<{ before: RowSnapshot; after: RowSnapshot }> {
  assertFullyVerified(manifest);
  const currentById = new Map(current.map((row) => [row.id, row]));
  if (currentById.size !== manifest.snapshot.length || current.length !== currentById.size) throw new Error("Rapper set changed since plan");
  const mapping = exportMapping(manifest);
  const targets = new Set(Object.values(mapping));
  const mapped = (value: string | null): string | null => {
    if (!value || value.startsWith("/") || value.startsWith("data:") || targets.has(value)) return value;
    const target = mapping[canonicalizeOssUrl(value)];
    if (!target) throw new Error("Database source has no verified target");
    return target;
  };
  const updates: Array<{ before: RowSnapshot; after: RowSnapshot }> = [];
  for (const before of manifest.snapshot) {
    const row = currentById.get(before.id);
    if (!row) throw new Error("Rapper set changed since plan");
    const after = { ...before };
    for (const field of MEDIA_FIELDS) {
      after[field] = mapped(before[field]);
      if (row[field] !== before[field] && row[field] !== after[field]) throw new Error(`Database reference changed: ${before.id}.${field}`);
    }
    if (MEDIA_FIELDS.some((field) => row[field] !== after[field])) updates.push({ before: { ...row }, after });
  }
  return updates;
}
