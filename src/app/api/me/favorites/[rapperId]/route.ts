import { getViewer } from "@/lib/server/viewer";
import { ok } from "@/lib/server/response";
import { addFavoriteForUser, removeFavoriteForUser } from "@/features/favorites/favorite.server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ rapperId: string }> },
) {
  const { rapperId } = await context.params;
  const viewer = await getViewer();
  await addFavoriteForUser({ userId: viewer.userId, rapperId });
  return ok({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ rapperId: string }> },
) {
  const { rapperId } = await context.params;
  const viewer = await getViewer();
  await removeFavoriteForUser({ userId: viewer.userId, rapperId });
  return ok({ success: true });
}
