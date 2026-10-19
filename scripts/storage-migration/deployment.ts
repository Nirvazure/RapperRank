import { storageVersion } from "../../src/lib/storage-version";
import { exportMapping, type Manifest } from "./core";
import { request } from "./transport";

export function assertDeploymentProof(manifest: Manifest, deploymentId: string, actual: unknown): ReturnType<typeof storageVersion> {
  const expected = storageVersion(exportMapping(manifest));
  if (!actual || typeof actual !== "object" || Array.isArray(actual)) throw new Error("Deployment returned no valid storage version proof");
  const proof = actual as Record<string, unknown>;
  for (const [field, value] of Object.entries(expected)) {
    if (proof[field] !== value) throw new Error(`Deployment storage version mismatch: ${field}`);
  }
  if (proof.deploymentId !== deploymentId) throw new Error("Deployment ID mismatch; use the successful compatible production deployment ID");
  return expected;
}

export async function verifyDeployment(manifest: Manifest, deployment: NonNullable<Manifest["deployment"]>, get: typeof request = request): Promise<NonNullable<Manifest["deployment"]>> {
  const url = new URL(deployment.url);
  const { response, bytes } = await get(new URL("/api/media/storage-version", url.origin), { method: "GET" });
  if (!response.ok) throw new Error(`Deployment storage version endpoint failed: HTTP ${response.status}`);
  let proof: unknown;
  try { proof = JSON.parse(bytes.toString("utf8")); } catch { throw new Error("Deployment storage version endpoint did not return JSON"); }
  const version = assertDeploymentProof(manifest, deployment.id, proof);
  return { ...deployment, verifiedAt: new Date().toISOString(), mappingSha256: version.mappingSha256 };
}
