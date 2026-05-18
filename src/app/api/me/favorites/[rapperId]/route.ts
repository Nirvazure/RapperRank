import { getAnonymousViewer } from "@/lib/server/auth-anonymous";
import { ok } from "@/lib/server/response";
import { addFavoriteForUser, removeFavoriteForUser } from "@/features/favorites/favorite.server";

export async function POST(
  _request: Request,
  context: { params: Promise<{ rapperId: string }> },
) {
  const { rapperId } = await context.params;
  const viewer = await getAnonymousViewer();
  await addFavoriteForUser({ userId: viewer.userId, rapperId });
  return ok({ success: true });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ rapperId: string }> },
) {
  const { rapperId } = await context.params;
  const viewer = await getAnonymousViewer();
  await removeFavoriteForUser({ userId: viewer.userId, rapperId });
  return ok({ success: true });
}
