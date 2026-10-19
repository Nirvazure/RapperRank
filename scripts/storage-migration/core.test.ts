// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { assignTargetKeys, assertFullyVerified, evidenceDigest, inventory, normalizeMime, prepareUpdates, publicUrl, selectAssets, sha256, type Asset, type Manifest, type RowSnapshot } from "./core";
import { applyInTransaction } from "./database";
import sourceNames from "../../src/data/storage-source-names.json";

const source = "https://rapperank.oss-cn-hangzhou.aliyuncs.com/%E4%B8%AD%E6%96%87%20name.jpg";
const row: RowSnapshot = { id: "rapper-1", avatarUrl: source, mediaUrl: null, backgroundAudioUrl: null };

export function fixtureManifest(): Manifest {
  const hash = sha256("original");
  const asset: Asset = {
    source, targetKey: "rapper/zhong-wen.jpg", kind: "image", bindings: [{ kind: "database", id: row.id, field: "avatarUrl" }], state: "copied", sourceSha256: hash,
    version: { etag: '"v1"', lastModified: "Mon, 19 Oct 2026 00:00:00 GMT", bytes: 8, mime: "image/jpeg" },
    objects: [
      { key: "rapper/zhong-wen.jpg", file: "objects/rapper/zhong-wen.jpg", sha256: hash, bytes: 8, mime: "image/jpeg", role: "original" },
      ...[128, 320, 800, 1200].map((width) => ({ key: `rapper/thumbs/zhong-wen-w${width}.webp`, file: `objects/rapper/thumbs/zhong-wen-w${width}.webp`, sha256: sha256("variant"), bytes: 7, mime: "image/webp", role: "image-variant" as const, width })),
    ], target: publicUrl("rapper/zhong-wen.jpg"),
  };
  const manifest: Manifest = { format: 2, runId: "test", createdAt: "2026-10-19T00:00:00Z", snapshot: [{ ...row }], assets: [asset] };
  manifest.verification = { at: "2026-10-19T00:01:00Z", full: true, digest: evidenceDigest(manifest), objects: asset.objects.map(({ key, sha256, bytes, mime }) => ({ key, sha256, bytes, mime })) };
  return manifest;
}

describe("migration inventory and verification evidence", () => {
  it("validates the complete checked-in name table without duplicate original or thumbnail keys", () => {
    const assets: Asset[] = Object.entries(sourceNames).map(([source, key]) => ({ source, kind: key.startsWith("music/") ? "audio" : "image", state: "planned", bindings: [], objects: [] }));
    assignTargetKeys(assets, sourceNames);
    expect(assets).toHaveLength(144);
    expect(assets.filter((asset) => asset.kind === "audio")).toHaveLength(27);
    expect(assets.every((asset) => asset.targetKey)).toBe(true);
  });
  it("requires complete readable names, preserves extensions and rejects object/thumbnail collisions", () => {
    const asset = (source: string, kind: Asset["kind"] = "image"): Asset => ({ source, kind, bindings: [], state: "planned", objects: [] });
    const photo = "https://rapperank.oss-cn-hangzhou.aliyuncs.com/photo.jpg";
    const other = "https://rapperank.oss-cn-hangzhou.aliyuncs.com/other.jpg";
    expect(() => assignTargetKeys([asset(photo)], {})).toThrow("Invalid readable");
    expect(() => assignTargetKeys([asset(photo)], { [photo]: "rapper/中文.jpg" })).toThrow("Invalid readable");
    expect(() => assignTargetKeys([asset(photo)], { [photo]: "rapper/photo.webp" })).toThrow("extension");
    expect(() => assignTargetKeys([asset(photo), asset(other)], { [photo]: "rapper/photo.jpg", [other]: "rapper/Photo.jpg" })).toThrow("conflict");
    const png = photo.replace("jpg", "png");
    expect(() => assignTargetKeys([asset(photo), asset(png)], { [photo]: "rapper/photo.jpg", [png]: "rapper/photo.png" })).toThrow("conflict");
    const audio = asset("https://rapperank.oss-cn-hangzhou.aliyuncs.com/song.mp3", "audio");
    assignTargetKeys([audio], { [audio.source]: "music/song.m4a" });
    expect(audio.targetKey).toBe("music/song.m4a");
    const album = asset("https://nirvazure-next.oss-cn-hangzhou.aliyuncs.com/album/art/album%20(1).jpg");
    assignTargetKeys([album], { [album.source]: "album/art/album (1).jpg" });
    expect(publicUrl(album.targetKey!)).toContain("album%20(1).jpg");
  });

  it("rejects the legacy hash manifest format even with a previous verification receipt", () => {
    const manifest = fixtureManifest();
    Object.assign(manifest, { format: 1 });
    expect(() => assertFullyVerified(manifest)).toThrow("new readable-path plan");
  });
  it("deduplicates canonical OSS variants while retaining every nullable DB field and binding", () => {
    const transformed = `${source}?x-oss-process=image/resize,w_320`;
    const rows = [{ ...row, mediaUrl: transformed }];
    const result = inventory(rows, [{ id: "label", field: "logoUrl", url: transformed }, { id: "pending", field: "logoUrl", url: "/pending.svg" }]);
    expect(result.assets).toHaveLength(1);
    expect(result.assets[0].source).toBe(source);
    expect(result.assets[0].bindings).toHaveLength(3);
    expect(result.snapshot[0]).toEqual({ ...row, mediaUrl: transformed });
    expect(result.snapshot[0].backgroundAudioUrl).toBeNull();
    rows[0].avatarUrl = "edited";
    expect(result.snapshot[0].avatarUrl).toBe(source);
  });

  it("recovers source references after the UI resolves static and DB mappings", () => {
    const target = publicUrl("rapper/zhong-wen.jpg");
    const result = inventory([{ ...row, avatarUrl: target }], [{ id: "album", field: "coverUrl", url: target }], { [source]: target });
    expect(result.assets[0].source).toBe(source);
    expect(result.assets[0].bindings).toHaveLength(2);
    expect(result.snapshot[0].avatarUrl).toBe(target);
  });

  it("rejects unsupported remote origins rather than silently omitting them", () => {
    expect(() => inventory([{ ...row, avatarUrl: "https://other.example/photo.jpg" }], [])).toThrow("Unsupported");
  });

  it("normalizes equivalent MIME types without erasing meaningful type differences", () => {
    expect(normalizeMime("Audio/X-M4A; charset=binary")).toBe("audio/mp4");
    expect(normalizeMime("image/jpeg; charset=UTF-8")).toBe("image/jpeg");
    expect(normalizeMime("image/png")).not.toBe(normalizeMime("image/jpeg"));
  });

  it("selects Chinese names, spaces, JPEG/WebP/PNG/M4A, and the largest MP3", () => {
    const asset = (name: string, mime: string, bytes: number): Asset => ({ source: `https://rapperank.oss-cn-hangzhou.aliyuncs.com/${encodeURIComponent(name)}`, kind: mime.startsWith("image") ? "image" : "audio", bindings: [], objects: [], state: "planned", version: { bytes, mime, etag: "1", lastModified: null } });
    const assets = [asset("中文.jpg", "image/jpeg", 20), asset("space name.webp", "image/webp", 20), asset("x.png", "image/png", 20), asset("x.m4a", "audio/mp4", 20), asset("small.mp3", "audio/mpeg", 20), asset("big.mp3", "audio/mpeg", 500)];
    expect(selectAssets(assets, true)).toEqual([assets[0], assets[1], assets[2], assets[3], assets[5]]);
    expect(selectAssets(assets, false)).toBe(assets);
  });

  it("blocks failed assets, sample-only receipts, changed snapshots and missing derivatives", () => {
    const manifest = fixtureManifest();
    expect(() => assertFullyVerified(manifest)).not.toThrow();
    manifest.assets[0].state = "failed";
    expect(() => assertFullyVerified(manifest)).toThrow("copied");
    manifest.assets[0].state = "copied";
    manifest.verification!.full = false;
    expect(() => assertFullyVerified(manifest)).toThrow("Full");
    manifest.verification!.full = true;
    manifest.snapshot[0].mediaUrl = "changed";
    expect(() => assertFullyVerified(manifest)).toThrow("current verification");
    manifest.snapshot[0].mediaUrl = null;
    manifest.assets[0].objects.pop();
    manifest.verification!.digest = evidenceDigest(manifest);
    expect(() => assertFullyVerified(manifest)).toThrow("four WebP");
  });
});

describe("database compare and set", () => {
  it("maps only media fields, preserves nulls, and skips already applied rows", () => {
    const manifest = fixtureManifest();
    const updates = prepareUpdates(manifest, [{ ...row }]);
    expect(updates).toHaveLength(1);
    expect(updates[0].after).toEqual({ ...row, avatarUrl: manifest.assets[0].target });
    expect(prepareUpdates(manifest, [updates[0].after])).toEqual([]);
  });

  it("rejects additions/deletions and nullable reference edits before any update", async () => {
    const manifest = fixtureManifest();
    expect(() => prepareUpdates(manifest, [])).toThrow("set changed");
    expect(() => prepareUpdates(manifest, [row, { ...row, id: "new" }])).toThrow("set changed");
    const compareAndSet = vi.fn();
    await expect(applyInTransaction(manifest, { lock: vi.fn(), snapshot: async () => [{ ...row, mediaUrl: "unexpected" }], compareAndSet })).rejects.toThrow("reference changed");
    expect(compareAndSet).not.toHaveBeenCalled();
  });

  it("acquires the transaction lock before snapshot and refuses a lost conditional update", async () => {
    const order: string[] = [];
    await expect(applyInTransaction(fixtureManifest(), {
      lock: async () => { order.push("lock"); }, snapshot: async () => { order.push("snapshot"); return [row]; },
      compareAndSet: async () => { order.push("update"); return 0; },
    })).rejects.toThrow("roll back");
    expect(order).toEqual(["lock", "snapshot", "update"]);
  });
});
