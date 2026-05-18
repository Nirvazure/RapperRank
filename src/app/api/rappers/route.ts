import { ok } from "@/lib/server/response";
import { getRankingPageData } from "@/features/rappers/rapper.server";

export async function GET() {
  const data = await getRankingPageData();
  return ok(data.rappers);
}
