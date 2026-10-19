import mapping from "@/data/storage-assets.json";
import { storageVersion } from "@/lib/storage-version";

export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({
    ...storageVersion(mapping),
    deploymentId: process.env.VERCEL_DEPLOYMENT_ID ?? null,
  }, { headers: { "Cache-Control": "no-store" } });
}
