import { isLocalMockViewerUserId, setLocalMockFavorite } from "@/features/dev/local-mock.server";
import { getViewer } from "@/lib/server/viewer";
import { ok } from "@/lib/server/response";
import { addFavoriteForUser, removeFavoriteForUser } from "@/features/favorites/favorite.server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ rapperId: string }> },
) {
  const { rapperId } = await context.params;
  const viewer = await getViewer();

  if (isLocalMockViewerUserId(viewer.userId)) {
    await setLocalMockFavorite(rapperId, true);
    return ok({ success: true, mocked: true });
  }

  await addFavoriteForUser({ userId: viewer.userId, rapperId });
  return ok({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ rapperId: string }> },
) {
  const { rapperId } = await context.params;
  const viewer = await getViewer();

  if (isLocalMockViewerUserId(viewer.userId)) {
    await setLocalMockFavorite(rapperId, false);
    return ok({ success: true, mocked: true });
  }

  await removeFavoriteForUser({ userId: viewer.userId, rapperId });
  return ok({ success: true });
}
