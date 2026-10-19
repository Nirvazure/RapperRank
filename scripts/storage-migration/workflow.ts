import { readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { assertCompleteAsset, assertFullyVerified, assertSameVersion, assertTargetKey, evidenceDigest, isPreviewDuration, publicUrl, selectAssets, sha256, type Asset, type Manifest, type Verification } from "./core";
import { artifactPath, generateArtifacts, probeAudio, readArtifact } from "./media";
import { compareObject, downloadSource, ensureObject, headSource, safeError, type ObjectTransport } from "./transport";

export async function concurrent<T>(items: T[], action: (item: T) => Promise<void>, limit = 4): Promise<void> {
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) await action(items[next++]);
  }));
}

export function manifestWriter(runDir: string, manifest: Manifest): () => Promise<void> {
  let pending = Promise.resolve();
  return () => {
    const content = `${JSON.stringify(manifest, null, 2)}\n`;
    pending = pending.then(async () => {
      const temporary = path.join(runDir, `manifest.${randomUUID()}.tmp`);
      await writeFile(temporary, content, "utf8");
      await rename(temporary, path.join(runDir, "manifest.json"));
    });
    return pending;
  };
}

export async function loadManifest(runDir: string): Promise<Manifest> {
  const manifest = JSON.parse(await readFile(path.join(runDir, "manifest.json"), "utf8")) as Manifest;
  if (manifest.format !== 2 || !Array.isArray(manifest.assets) || !Array.isArray(manifest.snapshot)) throw new Error("Unsupported migration manifest; create a new readable-path plan");
  return manifest;
}

export async function snapshotSources(manifest: Manifest, save: () => Promise<void>): Promise<void> {
  const failures: string[] = [];
  await concurrent(manifest.assets, async (asset) => {
    try {
      asset.version = await headSource(asset.source);
      assertTargetKey(asset);
      if (!asset.version.mime.startsWith(`${asset.kind}/`)) throw new Error(`Unexpected MIME: ${asset.version.mime}`);
      delete asset.error;
    } catch (error) { asset.error = safeError(error); failures.push(asset.source); }
    await save();
  });
  if (failures.length) throw new Error(`Plan incomplete: ${failures.length} source HEAD failures; details in manifest`);
}

export async function assertSourcesUnchanged(assets: Asset[]): Promise<void> {
  const failures: string[] = [];
  await concurrent(assets, async (asset) => {
    try {
      if (!asset.version) throw new Error("Asset has no source snapshot");
      assertSameVersion(asset.version, await headSource(asset.source));
    } catch (error) { failures.push(`${asset.source}: ${safeError(error)}`); }
  });
  if (failures.length) throw new Error(`Source validation failed; replan before switching references:\n${failures.join("\n")}`);
}

export async function copyAssets(manifest: Manifest, runDir: string, transport: ObjectTransport, sample: boolean, save: () => Promise<void>, log: (message: string) => void = console.log): Promise<void> {
  delete manifest.verification;
  await save();
  const assets = selectAssets(manifest.assets, sample);
  const failures: string[] = [];
  await concurrent(assets, async (asset) => {
    try {
      if (!asset.version) throw new Error("Asset has no source snapshot; create a successful plan first");
      assertSameVersion(asset.version, await headSource(asset.source));
      if (asset.state !== "copied") {
        const bytes = await downloadSource(asset.source, asset.version);
        asset.sourceSha256 = sha256(bytes);
        asset.objects = await generateArtifacts(runDir, asset, bytes);
      }
      const target = asset.objects.find((object) => object.role === (asset.kind === "audio" ? "audio-preview" : "original"));
      if (!target) throw new Error("Generated asset has no target object");
      asset.target = publicUrl(target.key);
      assertCompleteAsset(asset);
      for (const object of asset.objects) await ensureObject(transport, object, await readArtifact(runDir, object));
      asset.state = "copied";
      delete asset.error;
      log(`Copied ${asset.kind}: ${asset.source}`);
    } catch (error) {
      asset.state = "failed";
      asset.error = safeError(error);
      failures.push(asset.source);
      log(`FAILED: ${asset.source}: ${asset.error}`);
    }
    await save();
  });
  log(`Copy ${sample ? "sample" : "full"}: ${assets.length - failures.length}/${assets.length} assets successful`);
  if (failures.length) throw new Error(`${failures.length} assets failed; rerun copy to resume (see manifest)`);
}

export async function verifyAssets(manifest: Manifest, runDir: string, transport: ObjectTransport, sample: boolean, save: () => Promise<void>, log: (message: string) => void = console.log): Promise<void> {
  // Clear the prior receipt before making requests; interrupted verification cannot authorize apply.
  delete manifest.verification;
  await save();
  const assets = selectAssets(manifest.assets, sample);
  if (!assets.length) throw new Error("No assets selected for verification");
  if (assets.some((asset) => asset.state !== "copied")) throw new Error("Selected assets must all be copied before verification");
  for (const asset of assets) assertCompleteAsset(asset);
  await assertSourcesUnchanged(assets);
  const objects = new Map(assets.flatMap((asset) => asset.objects).map((object) => [object.key, object]));
  const records: Verification[] = [];
  const failures: string[] = [];
  await concurrent([...objects.values()], async (object) => {
    try {
      const local = await readArtifact(runDir, object);
      const actual = await transport.get(object.key);
      const record = compareObject(object, actual);
      if (object.role === "audio-preview") {
        const info = await probeAudio(artifactPath(runDir, object.file));
        if (info.codec !== "aac" || !isPreviewDuration(info.duration)) throw new Error("Public preview is not a 15 second AAC file");
        const range = await transport.get(object.key, "bytes=0-1023");
        const end = Math.min(1023, object.bytes - 1);
        if (range.status !== 206 || range.contentRange !== `bytes 0-${end}/${object.bytes}` || range.mime !== object.mime || !range.bytes.equals(local.subarray(0, end + 1))) throw new Error(`Audio Range verification failed: ${object.key}`);
        Object.assign(record, info, { range: true });
      }
      records.push(record);
      if (records.length % 50 === 0) log(`Verification progress: ${records.length}/${objects.size} objects`);
    } catch (error) { failures.push(`${object.key}: ${safeError(error)}`); }
  });
  manifest.verification = { at: new Date().toISOString(), full: !sample && failures.length === 0, digest: evidenceDigest(manifest), objects: records.sort((a, b) => a.key.localeCompare(b.key)) };
  await save();
  for (const failure of failures) log(`FAILED: ${failure}`);
  if (failures.length) throw new Error(`${failures.length} objects failed verification; mapping export/apply blocked`);
  if (!sample) assertFullyVerified(manifest);
  log(`Verified ${sample ? "sample only" : "full inventory"}: ${records.length} objects`);
}

export async function validateLocalEvidence(manifest: Manifest, runDir: string): Promise<void> {
  assertFullyVerified(manifest);
  const objects = new Map(manifest.assets.flatMap((asset: Asset) => asset.objects).map((object) => [object.key, object]));
  await concurrent([...objects.values()], async (object) => { await readArtifact(runDir, object); });
  await concurrent(manifest.assets.filter((asset) => asset.kind === "audio"), async (asset) => {
    const source = await readFile(artifactPath(runDir, asset.sourceFile!));
    if (sha256(source) !== asset.sourceSha256 || source.length !== asset.sourceBytes) throw new Error(`Local audio source evidence mismatch: ${asset.source}`);
  });
}
