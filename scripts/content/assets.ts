import { z } from "zod";
import { canStoreAsset } from "../../src/features/content/content.policy";

export const assetManifestSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(120),
  owner: z.enum(["rapper", "track", "album"]), ownerId: z.string().regex(/^[a-zA-Z0-9_-]+$/).max(160),
  kind: z.enum(["image", "audio_preview", "audio_full"]),
  file: z.string().min(1), sha256: z.string().regex(/^[a-f0-9]{64}$/),
  caption: z.string().min(1), attribution: z.string().min(1),
  rightsBasis: z.string().min(1), redistributionAllowed: z.literal(true),
  fullAudioAuthorized: z.boolean().default(false), reviewStatus: z.literal("approved"),
  source: z.object({ id: z.string().regex(/^[a-zA-Z0-9_-]+$/), title: z.string().min(1), url: z.url(), retrievedAt: z.iso.datetime(), reviewer: z.string().min(1) }),
}).superRefine((value, ctx) => {
  if (!canStoreAsset({ ...value, sourceUrl: value.source.url })) ctx.addIssue({ code: "custom", message: "Asset rights or source do not permit redistribution" });
  if (value.kind.startsWith("audio") && value.owner !== "track") ctx.addIssue({ code: "custom", message: "Audio requires an exact track identity" });
  if (value.kind === "audio_full" && !value.fullAudioAuthorized) ctx.addIssue({ code: "custom", message: "Full audio requires explicit full-recording authorization" });
});

export const playbackEvidenceSchema = z.array(z.object({
  id: z.string().min(1), url: z.url(), checkedAt: z.iso.datetime(),
  checkType: z.enum(["playback", "external_page"]).default("playback"),
  officialPageObserved: z.boolean().default(false),
  outcome: z.enum(["available", "unavailable"]), reviewer: z.string().min(1), note: z.string().min(10),
  observedSeconds: z.number().nonnegative(), durationSeconds: z.number().positive().nullable(), pausedObserved: z.boolean(),
}).superRefine((value, ctx) => {
  const age = Date.now() - new Date(value.checkedAt).getTime();
  if (age < 0 || age > 24 * 60 * 60 * 1000) ctx.addIssue({ code: "custom", message: "Evidence must be from the last 24 hours" });
  if (value.outcome === "available") {
    if (value.checkType === "external_page") {
      if (!value.officialPageObserved) ctx.addIssue({ code: "custom", message: "External links require an observed official page identity and regional conditions" });
    } else if (!value.pausedObserved || value.observedSeconds < 1 || !value.durationSeconds) ctx.addIssue({ code: "custom", message: "Playable status requires observed media progress, duration and pause" });
  }
})).superRefine((items, ctx) => {
  if (new Set(items.map((item) => item.id)).size !== items.length) ctx.addIssue({ code: "custom", message: "Duplicate playback evidence" });
});
