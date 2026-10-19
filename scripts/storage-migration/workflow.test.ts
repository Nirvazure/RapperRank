// @vitest-environment node
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { afterEach, describe, expect, it, vi } from "vitest";
import { assertSourcesUnchanged, copyAssets, verifyAssets } from "./workflow";
import { assertFullyVerified, evidenceDigest, publicUrl, sha256, type Asset, type Manifest } from "./core";
import { ensureObject, type ObjectTransport } from "./transport";

const directories: string[] = [];
afterEach(async () => { vi.unstubAllGlobals(); for (const directory of directories.splice(0)) await rm(directory, { recursive: true, force: true }); });

async function imageFixture(): Promise<{ manifest: Manifest; directory: string; transport: ObjectTransport }> {
  const directory = await mkdtemp(path.join(os.tmpdir(), "rapperank-workflow-"));
  directories.push(directory);
  const bytes = Buffer.from("original");
  const hash = sha256(bytes);
  const asset: Asset = { source: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/photo.jpg", targetKey: "rapper/photo.jpg", kind: "image", bindings: [], state: "copied", sourceSha256: hash, objects: [], version: { etag: "v1", lastModified: null, bytes: 8, mime: "image/jpeg" }, target: publicUrl("rapper/photo.jpg") };
  const data = new Map<string, Buffer>();
  const add = async (key: string, mime: string, buffer: Buffer, role: "original" | "image-variant", width?: number) => {
    const file = `objects/${key}`;
    await mkdir(path.dirname(path.join(directory, file)), { recursive: true });
    await writeFile(path.join(directory, file), buffer);
    asset.objects.push({ key, file, mime, bytes: buffer.length, sha256: sha256(buffer), role, width });
    data.set(key, buffer);
  };
  await add("rapper/photo.jpg", "image/jpeg", bytes, "original");
  for (const width of [128, 320, 800, 1200]) await add(`rapper/thumbs/photo-w${width}.webp`, "image/webp", Buffer.from(`variant${width}`), "image-variant", width);
  const manifest: Manifest = { format: 2, runId: "test", createdAt: "now", snapshot: [], assets: [asset] };
  vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response(null, { status: 200, headers: { etag: "v1", "content-length": "8", "content-type": "image/jpeg" } })));
  const transport: ObjectTransport = { get: vi.fn(async (key) => ({ status: 200, bytes: data.get(key)!, mime: key.endsWith("jpg") ? "image/jpeg" : "image/webp" })), upload: vi.fn() };
  return { manifest, directory, transport };
}

describe("verification gate", () => {
  it("rechecks planned source versions before target verification and before apply", async () => {
    const { manifest, directory, transport } = await imageFixture();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200, headers: { etag: "changed", "content-length": "8", "content-type": "image/jpeg" } })));
    await expect(verifyAssets(manifest, directory, transport, false, vi.fn(), vi.fn())).rejects.toThrow("replan before switching");
    expect(transport.get).not.toHaveBeenCalled();
    expect(manifest.verification).toBeUndefined();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200, headers: { etag: "changed", "content-length": "8", "content-type": "image/jpeg" } })));
    await expect(assertSourcesUnchanged(manifest.assets)).rejects.toThrow("source changed");
  });
  it("fetches every original and derivative, producing full bound verification", async () => {
    const { manifest, directory, transport } = await imageFixture();
    await verifyAssets(manifest, directory, transport, false, vi.fn(), vi.fn());
    expect(transport.get).toHaveBeenCalledTimes(5);
    expect(manifest.verification!.objects).toHaveLength(5);
    expect(() => assertFullyVerified(manifest)).not.toThrow();
  });

  it("sample verify never authorizes full export/apply even when sample covers all assets", async () => {
    const { manifest, directory, transport } = await imageFixture();
    await verifyAssets(manifest, directory, transport, true, vi.fn(), vi.fn());
    expect(manifest.verification!.full).toBe(false);
    expect(() => assertFullyVerified(manifest)).toThrow("Full");
  });

  it("one corrupt derivative invalidates previous full evidence and blocks apply", async () => {
    const { manifest, directory, transport } = await imageFixture();
    manifest.verification = { at: "old", full: true, digest: evidenceDigest(manifest), objects: [] };
    transport.get = vi.fn(async (key) => ({ status: 200, bytes: Buffer.from("corrupt"), mime: key.endsWith("jpg") ? "image/jpeg" : "image/webp" }));
    await expect(verifyAssets(manifest, directory, transport, false, vi.fn(), vi.fn())).rejects.toThrow("verification");
    expect(manifest.verification!.full).toBe(false);
    expect(() => assertFullyVerified(manifest)).toThrow();
  });

  it("copy resume still guards source version and verifies existing objects without uploading", async () => {
    const { manifest, directory, transport } = await imageFixture();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200, headers: { etag: "v1", "content-length": "8", "content-type": "image/jpeg" } })));
    await copyAssets(manifest, directory, transport, false, vi.fn(), vi.fn());
    expect(manifest.assets[0].state).toBe("copied");
    expect(transport.get).toHaveBeenCalledTimes(5);
    expect(transport.upload).not.toHaveBeenCalled();
  });

  it("source version changes fail copy, clear verification, and never upload", async () => {
    const { manifest, directory, transport } = await imageFixture();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: 200, headers: { etag: "new", "content-length": "8", "content-type": "image/jpeg" } })));
    await expect(copyAssets(manifest, directory, transport, false, vi.fn(), vi.fn())).rejects.toThrow("failed");
    expect(manifest.assets[0].state).toBe("failed");
    expect(manifest.assets[0].error).toContain("source changed");
    expect(manifest.verification).toBeUndefined();
    expect(transport.upload).not.toHaveBeenCalled();
  });

  it("rejects any full audio object before an anonymous request or upload", async () => {
    const transport: ObjectTransport = { get: vi.fn(), upload: vi.fn() };
    const bytes = Buffer.from("audio");
    await expect(ensureObject(transport, { key: `originals/audio/${sha256(bytes)}.mp3`, file: "source", role: "original", bytes: 5, sha256: sha256(bytes), mime: "audio/mpeg" }, bytes)).rejects.toThrow("never be uploaded");
    expect(transport.get).not.toHaveBeenCalled();
    expect(transport.upload).not.toHaveBeenCalled();
  });
});
