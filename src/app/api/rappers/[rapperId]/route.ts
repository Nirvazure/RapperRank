import { getViewer } from "@/lib/server/viewer";
import { notFound, ok } from "@/lib/server/response";
import { getRapperPageData } from "@/features/rappers/rapper.server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ rapperId: string }> },
) {
  const { rapperId } = await context.params;
  const viewer = await getViewer();

  try {
    const data = await getRapperPageData(rapperId, viewer.userId);
    return ok(data);
  } catch {
    return notFound("Rapper not found");
  }
}
