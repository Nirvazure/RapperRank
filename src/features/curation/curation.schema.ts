import { z } from "zod";
import type { CurationOverrides } from "@/features/curation/curation.types";
import { MAX_PH_RATING, MAX_RATING, MIN_PH_RATING, MIN_RATING } from "@/lib/constants";

const integerRatingValueSchema = z.number().int().min(MIN_RATING).max(MAX_RATING);
const integerPhRatingValueSchema = z
  .number()
  .int()
  .min(MIN_PH_RATING)
  .max(MAX_PH_RATING);

export const curationRatingSchema = z.object({
  flow: integerRatingValueSchema,
  lyrics: integerRatingValueSchema,
  voice: integerRatingValueSchema,
  technique: integerRatingValueSchema,
  melody: integerRatingValueSchema,
  stage: integerRatingValueSchema,
  ph: integerPhRatingValueSchema,
});

export const curationOverridesSchema = z.object({
  version: z.literal(1),
  updatedAt: z.iso.datetime().nullable(),
  excludedRapperIds: z.array(z.string().min(1)),
  ratingOverrides: z.record(z.string().min(1), curationRatingSchema),
});

export const defaultCurationOverrides: CurationOverrides = {
  version: 1,
  updatedAt: null,
  excludedRapperIds: [],
  ratingOverrides: {},
};
