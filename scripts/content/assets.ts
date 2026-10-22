import { z } from "zod";

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
