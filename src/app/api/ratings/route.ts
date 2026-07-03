import { z } from "zod";
import { getViewer } from "@/lib/server/viewer";
import { badRequest, ok } from "@/lib/server/response";
import { submitRapperRating } from "@/features/ratings/rating.server";
import { ratingDimensionSchema } from "@/features/ratings/rating.schema";
import { revalidateRapperPublicCache } from "@/features/rappers/rapper.cache";

const payloadSchema = z.object({
  rapperId: z.string().min(1),
  ratings: ratingDimensionSchema,
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(json);

  if (!parsed.success) {
    return badRequest("Invalid rating payload");
  }

  const viewer = await getViewer();
  const aggregate = await submitRapperRating({
    userId: viewer.userId,
    rapperId: parsed.data.rapperId,
    ratings: parsed.data.ratings,
  });

  await revalidateRapperPublicCache(parsed.data.rapperId);

  return ok(aggregate);
}
