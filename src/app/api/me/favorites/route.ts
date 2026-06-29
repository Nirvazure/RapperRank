import { getViewer } from "@/lib/server/viewer";
import { ok } from "@/lib/server/response";
import { getViewerFavorites } from "@/features/user/user.server";

export async function GET() {
  const viewer = await getViewer();
  const favorites = await getViewerFavorites(viewer.userId);
  return ok(favorites);
}
