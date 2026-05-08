import { z } from "zod";
import { ratingDimensionSchema } from "@/features/ratings/rating.schema";

export const rapperSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  alias: z.string().optional(),
  region: z.string().min(1),
  avatarUrl: z.url(),
  mediaUrl: z.url(),
  mediaType: z.enum(["image", "gif", "video"]),
  bio: z.string().min(1),
  shortReview: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  representativeWorks: z.array(z.string().min(1)).min(1),
  ratingCount: z.number().int().nonnegative(),
  averageRatings: ratingDimensionSchema,
});

export const rappersSchema = z.array(rapperSchema).length(10);
