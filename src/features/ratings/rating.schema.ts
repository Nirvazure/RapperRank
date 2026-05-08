import { z } from "zod";
import { MAX_RATING, MIN_RATING } from "@/lib/constants";

export const ratingValueSchema = z.number().min(MIN_RATING).max(MAX_RATING);

export const ratingDimensionSchema = z.object({
  flow: ratingValueSchema,
  lyrics: ratingValueSchema,
  voice: ratingValueSchema,
  technique: ratingValueSchema,
  melody: ratingValueSchema,
  stage: ratingValueSchema,
});

export const userRatingSchema = z.object({
  userId: z.string().min(1),
  rapperId: z.string().min(1),
  ratings: ratingDimensionSchema,
  createdAt: z.iso.datetime(),
  updatedAt: z.iso.datetime(),
});
