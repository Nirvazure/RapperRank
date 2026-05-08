import { z } from "zod";
import { userRatingSchema } from "@/features/ratings/rating.schema";

export const mockUserSchema = z.object({
  id: z.string().min(1),
  displayName: z.string().min(1),
  avatarUrl: z.url().optional(),
  favoriteRapperIds: z.array(z.string().min(1)),
  ratings: z.array(userRatingSchema),
});
