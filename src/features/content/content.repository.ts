import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { canPublishAlbum, isCheckedSource, safePlaybackUrl } from "./content.policy";
import type { AlbumView, RapperContent, TrackView } from "./content.types";
import { z } from "zod";
import { storageObjectPublicUrl } from "@/lib/storage-media";

const timelineSchema = z.array(z.object({ date: z.string(), text: z.string(), sourceId: z.string() }));
const linksSchema = z.array(z.object({ label: z.string(), url: z.url().startsWith("https://") }));
const trackInclude = { playback: true } satisfies Prisma.TrackInclude;
const albumInclude = {
  playback: true,
  assets: { where: { reviewStatus: "approved", redistributionAllowed: true } },
  tracks: {
    where: { track: { reviewStatus: "approved" } },
    orderBy: [{ discNumber: "asc" }, { position: "asc" }],
    include: { track: { include: trackInclude } },
  },
} satisfies Prisma.AlbumInclude;
const artistTrackInclude = {
  track: { include: { ...trackInclude, albums: { include: { album: { include: albumInclude } } } } },
} satisfies Prisma.RapperTrackInclude;
type TrackRecord = Prisma.TrackGetPayload<{ include: typeof trackInclude }>;
type PlaybackRecord = TrackRecord["playback"][number];
function mapPlayback(source: PlaybackRecord) {
  return { id: source.id, kind: source.kind, provider: source.provider, url: source.url, storefront: source.storefront, durationSeconds: source.durationSeconds, conditions: source.conditions, status: source.status, checkedAt: source.checkedAt?.toISOString() ?? null, reviewStatus: source.reviewStatus };
}
function mapTrack(track: TrackRecord): TrackView {
  return { id: track.id, title: track.title, artistCredit: track.artistCredit, version: track.version, releasedAt: track.releasedAt?.toISOString().slice(0, 10) ?? null, durationMs: track.durationMs, sources: track.playback.filter((source) => source.reviewStatus === "approved" && safePlaybackUrl(source)).map(mapPlayback) };
}

export async function getRapperContent(rapperId: string): Promise<RapperContent | undefined> {
  try {
    const record = await prisma.rapper.findUnique({
      where: { id: rapperId },
      select: {
        profileTimeline: true, officialLinks: true, contentReviewedAt: true,
        contentSources: { where: { reviewStatus: "approved" }, orderBy: { id: "asc" } },
        assets: { where: { reviewStatus: "approved", redistributionAllowed: true, kind: "image", source: { reviewStatus: "approved" } }, orderBy: { sortOrder: "asc" }, include: { source: true } },
        tracks: { where: { track: { reviewStatus: "approved" } }, orderBy: { sortOrder: "asc" }, include: artistTrackInclude },
      },
    });
    if (!record) return undefined;
    const albums = new Map<string, AlbumView>();
    for (const entry of record.tracks) for (const membership of entry.track.albums) {
      const album = membership.album;
      if (album.reviewStatus !== "approved") continue;
      const view: AlbumView = { id: album.id, title: album.title, artistCredit: album.artistCredit, releasedAt: album.releasedAt?.toISOString().slice(0, 10) ?? null, sources: album.playback.filter((source) => isCheckedSource(source)).map(mapPlayback), tracks: album.tracks.map((item) => mapTrack(item.track)), coverUrl: album.assets.find((asset) => asset.kind === "image" && asset.bucket === "rapperank")?.objectPath };
      if (view.coverUrl) view.coverUrl = storageObjectPublicUrl(view.coverUrl);
      if (canPublishAlbum(view)) albums.set(view.id, view);
    }
    return {
      timeline: record.contentReviewedAt ? timelineSchema.parse(record.profileTimeline) : [],
      officialLinks: record.contentReviewedAt ? linksSchema.parse(record.officialLinks) : [],
      references: record.contentSources.map(({ id, title, url, fields }) => ({ id, title, url, fields })),
      tracks: record.tracks.filter((item) => item.role !== "album").map((item) => mapTrack(item.track)), albums: [...albums.values()],
      gallery: record.assets.filter((asset) => asset.bucket === "rapperank" && asset.mime.startsWith("image/")).map((asset) => ({ id: asset.id, url: storageObjectPublicUrl(asset.objectPath), caption: asset.caption, attribution: asset.attribution, rightsBasis: asset.rightsBasis, sourceUrl: asset.source.url })),
    };
  } catch (error) {
    // Allow a rolling deployment before the additive migration has reached the database.
    if (error instanceof Prisma.PrismaClientKnownRequestError && ["P2021", "P2022"].includes(error.code)) return undefined;
    throw error;
  }
}
