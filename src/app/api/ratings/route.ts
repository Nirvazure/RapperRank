import { ratingSubmissionSchema } from "@/features/ratings/rating.schema";
import { isLocalMockViewerUserId, submitLocalMockRating } from "@/features/dev/local-mock.server";
import { getViewer } from "@/lib/server/viewer";
import { badRequest, ok } from "@/lib/server/response";
import { submitRapperRating } from "@/features/ratings/rating.server";
import { revalidateRapperPublicCache } from "@/features/rappers/rapper.cache";

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = ratingSubmissionSchema.safeParse(json);

  if (!parsed.success) {
    return badRequest("Invalid rating payload");
  }

  const viewer = await getViewer();
  if (isLocalMockViewerUserId(viewer.userId)) {
    const rating = await submitLocalMockRating({
      rapperId: parsed.data.rapperId,
      submission: {
        ratings: parsed.data.ratings,
        fondness: parsed.data.fondness ?? null,
      },
    });

    return ok({
      success: true,
      mocked: true,
      rating,
    });
  }

  const aggregate = await submitRapperRating({
    userId: viewer.userId,
    rapperId: parsed.data.rapperId,
    ratings: parsed.data.ratings,
    fondness: parsed.data.fondness ?? null,
  });

  await revalidateRapperPublicCache(parsed.data.rapperId);

  return ok(aggregate);
}
