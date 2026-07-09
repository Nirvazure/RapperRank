import { getViewer } from "@/lib/server/viewer";
import { ok } from "@/lib/server/response";
import { getViewerRatingsPage } from "@/features/user/user.server";

function parsePositiveInt(value: string | null, fallback: number) {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parsePositiveInt(searchParams.get("page"), 1);
  const pageSize = parsePositiveInt(searchParams.get("pageSize"), 6);
  const viewer = await getViewer();
  const ratingsPage = await getViewerRatingsPage(viewer.userId, page, pageSize);

  return ok(ratingsPage);
}
