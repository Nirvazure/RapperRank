import { z } from "zod";
import { MAX_PH_RATING, MAX_RATING, MIN_PH_RATING, MIN_RATING } from "@/lib/constants";

export const ratingValueSchema = z.number().min(MIN_RATING).max(MAX_RATING);
export const phRatingValueSchema = z.number().min(MIN_PH_RATING).max(MAX_PH_RATING);

export const ratingDimensionSchema = z.object({
  flow: ratingValueSchema,
  lyrics: ratingValueSchema,
  voice: ratingValueSchema,
  technique: ratingValueSchema,
  melody: ratingValueSchema,
  stage: ratingValueSchema,
  ph: phRatingValueSchema.optional(),
});

export const userRatingSchema = z.object({
  userId: z.string().min(1),
  rapperId: z.string().min(1),
  ratings: ratingDimensionSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
