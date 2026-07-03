import { z } from "zod";

const imageUrlSchema = z.url().refine(
  (value) => value.startsWith("https://rapperank.oss-cn-hangzhou.aliyuncs.com/rapper/"),
  {
    message: "Rapper images must use the public OSS rapper path.",
  },
);

export const rapperSeedSchema = z.object({
  seedKey: z.string().min(1),
  name: z.string().min(1),
  aliases: z.array(z.string().min(1)).default([]),
  labels: z.array(z.string().min(1)).optional(),
  region: z.string().min(1),
  avatarUrl: imageUrlSchema.optional(),
  mediaUrl: imageUrlSchema.optional(),
  mediaType: z.enum(["image", "gif", "video"]),
  backgroundAudioUrl: z.string().url().optional(),
  bio: z.string().min(1),
  tags: z.array(z.string().min(1)).min(1),
  representativeWorks: z.array(z.string().min(1)).min(1),
});

export const rapperSeedRecordsSchema = z.array(rapperSeedSchema).min(1);

/** @deprecated Use rapperSeedSchema */
export const rapperSchema = rapperSeedSchema;
/** @deprecated Use rapperSeedRecordsSchema */
export const rappersSchema = rapperSeedRecordsSchema;
