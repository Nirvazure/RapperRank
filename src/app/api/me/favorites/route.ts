import { getAnonymousViewer } from "@/lib/server/auth-anonymous";
import { ok } from "@/lib/server/response";
import { getViewerFavorites } from "@/features/user/user.server";

export async function GET() {
  const viewer = await getAnonymousViewer();
  const favorites = await getViewerFavorites(viewer.userId);
  return ok(favorites);
}
