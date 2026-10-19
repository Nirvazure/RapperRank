// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { storageVersion } from "../../src/lib/storage-version";
import { assertDeploymentProof, verifyDeployment } from "./deployment";
import { evidenceDigest, exportMapping, publicUrl, sha256, type Manifest } from "./core";

function fixture(): Manifest {
  const hash = sha256("original");
  const objects = [{ key: "rapper/photo.jpg", file: "source.jpg", role: "original" as const, sha256: hash, bytes: 8, mime: "image/jpeg" }, ...[128, 320, 800, 1200].map((width) => ({ key: `rapper/thumbs/photo-w${width}.webp`, file: `${width}.webp`, width, role: "image-variant" as const, sha256: sha256("variant"), bytes: 7, mime: "image/webp" }))];
  const manifest: Manifest = { format: 2, runId: "test", createdAt: "now", snapshot: [], assets: [{ source: "https://rapperank.oss-cn-hangzhou.aliyuncs.com/photo.jpg", targetKey: "rapper/photo.jpg", kind: "image", bindings: [], state: "copied", sourceSha256: hash, version: { etag: "v1", lastModified: null, bytes: 8, mime: "image/jpeg" }, objects, target: publicUrl(objects[0].key) }] };
  manifest.verification = { at: "now", full: true, digest: evidenceDigest(manifest), objects: objects.map(({ key, sha256, bytes, mime }) => ({ key, sha256, bytes, mime })) };
  return manifest;
}

describe("production compatibility proof", () => {
  it("requires the exact deployed mapping, recipes, bucket/schema and deployment ID", () => {
    const manifest = fixture();
    const proof = { ...storageVersion(exportMapping(manifest)), deploymentId: "dpl_success" };
    expect(assertDeploymentProof(manifest, "dpl_success", proof)).toMatchObject({ schema: 2, bucket: "rapperank" });
    for (const field of ["schema", "bucket", "mappingSha256", "imageRecipe", "audioRecipe", "deploymentId"]) expect(() => assertDeploymentProof(manifest, "dpl_success", { ...proof, [field]: "stale" })).toThrow();
    expect(() => assertDeploymentProof(manifest, "dpl_success", null)).toThrow("valid");
  });

  it("fetches the deployment origin endpoint and persists bound proof metadata", async () => {
    const manifest = fixture();
    const proof = { ...storageVersion(exportMapping(manifest)), deploymentId: "dpl_success" };
    const get = vi.fn().mockResolvedValue({ response: new Response(null, { status: 200 }), bytes: Buffer.from(JSON.stringify(proof)) });
    const verified = await verifyDeployment(manifest, { url: "https://production.example/some/path", id: "dpl_success", suppliedAt: "now" }, get);
    expect(String(get.mock.calls[0][0])).toBe("https://production.example/api/media/storage-version");
    expect(verified.mappingSha256).toBe(proof.mappingSha256);
    expect(verified.verifiedAt).toBeTruthy();
  });

  it("rejects unsuccessful or non-JSON endpoint responses", async () => {
    const deployment = { url: "https://production.example", id: "dpl_success", suppliedAt: "now" };
    await expect(verifyDeployment(fixture(), deployment, vi.fn().mockResolvedValue({ response: new Response(null, { status: 404 }), bytes: Buffer.alloc(0) }))).rejects.toThrow("HTTP 404");
    await expect(verifyDeployment(fixture(), deployment, vi.fn().mockResolvedValue({ response: new Response(null, { status: 200 }), bytes: Buffer.from("<html>") }))).rejects.toThrow("JSON");
  });
});
