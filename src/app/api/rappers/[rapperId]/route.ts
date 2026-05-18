import { getAnonymousViewer } from "@/lib/server/auth-anonymous";
import { notFound, ok } from "@/lib/server/response";
import { getRapperPageData } from "@/features/rappers/rapper.server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ rapperId: string }> },
) {
  const { rapperId } = await context.params;
  const viewer = await getAnonymousViewer();

  try {
    const data = await getRapperPageData(rapperId, viewer.userId);
    return ok(data);
  } catch {
    return notFound("Rapper not found");
  }
}
