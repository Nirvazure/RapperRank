import { z } from "zod";
import { safePlaybackUrl } from "../../src/features/content/content.policy";

const id = z.string().regex(/^[a-zA-Z0-9_-]+$/).min(1).max(160);
const https = z.url().refine((value) => { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; }, "Expected credential-free HTTPS URL");
const review = z.enum(["pending", "approved", "rejected"]);
const source = z.object({ id, title: z.string().min(1), url: https, fields: z.array(z.string()).min(1), retrievedAt: z.iso.datetime(), reviewStatus: review, reviewer: z.string().min(1) });
const playback = z.object({ id, kind: z.enum(["external", "embed", "audio_preview", "audio_full"]), provider: z.string(), platformId: z.string().min(1), storefront: z.string().regex(/^[a-z]{2}$/), url: https, durationSeconds: z.number().int().positive().nullable(), conditions: z.string().min(1), status: z.enum(["pending", "available", "unavailable"]), checkedAt: z.iso.datetime().nullable(), verificationNote: z.string().nullable(), reviewStatus: review }).superRefine((value, ctx) => {
  if (!safePlaybackUrl(value)) ctx.addIssue({ code: "custom", message: "Unsupported playback host or URL" });
  if (value.status === "available" && (!value.checkedAt || !value.verificationNote?.trim())) ctx.addIssue({ code: "custom", message: "Available playback requires timestamp and verification evidence" });
});
const track = z.object({ id, title: z.string().min(1), artistCredit: z.string().min(1), version: z.string().min(1), releasedAt: z.iso.date().nullable(), durationMs: z.number().int().positive().nullable(), reviewStatus: review, role: z.string().default("primary"), source: source, playback: z.array(playback) });

export const contentManifestSchema = z.object({
  version: z.literal(1),
  artists: z.array(z.object({
    rapperId: id, name: z.string().min(1), expectedBio: z.string(), bio: z.string().min(200).max(400),
    timeline: z.array(z.object({ date: z.string(), text: z.string(), sourceId: id })).min(3).max(5),
    officialLinks: z.array(z.object({ label: z.string().min(1), url: https })).min(1),
    sources: z.array(source).min(1), tracks: z.array(track),
    albums: z.array(z.object({ id, title: z.string().min(1), artistCredit: z.string(), releasedAt: z.iso.date().nullable(), reviewStatus: review, source, playback: z.array(playback), tracks: z.array(z.object({ trackId: id, position: z.number().int().positive(), discNumber: z.number().int().positive() })) })).max(1),
    unresolvedWorks: z.array(z.object({ title: z.string(), reason: z.string() })),
  })).superRefine((artists, ctx) => {
    const ids = artists.map((artist) => artist.rapperId);
    if (new Set(ids).size !== ids.length) ctx.addIssue({ code: "custom", message: "Duplicate artist identity" });
    for (const artist of artists) {
      if (artist.sources.some((reference) => reference.reviewStatus !== "approved")) ctx.addIssue({ code: "custom", message: "Profile sources must be reviewed before publishing a biography" });
      const references = new Set(artist.sources.map((reference) => reference.id));
      if (artist.timeline.some((entry) => !references.has(entry.sourceId))) ctx.addIssue({ code: "custom", message: "Timeline has an unknown source" });
      const tracks = new Set(artist.tracks.map((item) => item.id));
      if (tracks.size !== artist.tracks.length) ctx.addIssue({ code: "custom", message: "Duplicate track identity" });
      for (const album of artist.albums) {
        if (album.tracks.some((item) => !tracks.has(item.trackId))) ctx.addIssue({ code: "custom", message: "Album has an unknown track" });
        const slots = album.tracks.map((item) => `${item.discNumber}:${item.position}`);
        if (new Set(slots).size !== slots.length) ctx.addIssue({ code: "custom", message: "Duplicate album position" });
      }
    }
  }),
});
export type ContentManifest = z.infer<typeof contentManifestSchema>;
