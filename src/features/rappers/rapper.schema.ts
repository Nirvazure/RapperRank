import { z } from "zod";
import { ratingDimensionSchema } from "@/features/ratings/rating.schema";

const imageUrlSchema = z.url().refine(
  (value) => value.startsWith("https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/"),
  {
    message: "Rapper images must use the public OSS rapper path.",
  },
);

export const rapperSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  chineseName: z.string().min(1).optional(),
  alias: z.string().optional(),
  labels: z.array(z.string().min(1)).optional(),
  region: z.string().min(1),
  avatarUrl: imageUrlSchema.optional(),
  mediaUrl: imageUrlSchema.optional(),
  mediaType: z.enum(["image", "gif", "video"]),
  backgroundAudioUrl: z.string().url().optional(),
  bio: z.string().min(1),
  shortReview: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  representativeWorks: z.array(z.string().min(1)).min(1),
  ratingCount: z.number().int().nonnegative(),
  averageRatings: ratingDimensionSchema,
});

export const rappersSchema = z.array(rapperSchema).min(1);
