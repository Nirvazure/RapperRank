import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { contentManifestSchema } from "./content/manifest";

loadEnvConfig(process.cwd());
const db = new PrismaClient();
const args = process.argv.slice(2);
async function main() {
  const file = args.find((arg) => arg.startsWith("--file="))?.slice(7) ?? "data/content/pilot.json";
  const manifest = contentManifestSchema.parse(JSON.parse(await readFile(file, "utf8")));
  const snapshot = await db.rapper.findMany({ where: { id: { in: manifest.artists.map((artist) => artist.rapperId) } }, select: { id: true, name: true, bio: true, contentReviewedAt: true } });
  for (const artist of manifest.artists) {
    const current = snapshot.find((item) => item.id === artist.rapperId);
    if (!current || current.name !== artist.name) throw new Error(`Artist identity mismatch: ${artist.name}`);
    if (current.bio !== artist.expectedBio && current.bio !== artist.bio) throw new Error(`Profile edited since discovery: ${artist.name}`);
    if (current.contentReviewedAt && current.bio !== artist.bio) throw new Error(`Already reviewed profile: ${artist.name}`);
  }
  console.log(JSON.stringify({ apply: args.includes("--apply"), artists: manifest.artists.map((artist) => ({ name: artist.name, tracks: artist.tracks.length, albums: artist.albums.length, unresolved: artist.unresolvedWorks })) }, null, 2));
  if (!args.includes("--apply")) return;
  await db.$transaction(async (tx) => {
    // Prevent a concurrent edit between preflight and the conditional profile update.
    await tx.$executeRaw`LOCK TABLE "rapperank"."Rapper", "rapperank"."Track", "rapperank"."Album", "rapperank"."RapperTrack", "rapperank"."AlbumTrack", "rapperank"."ContentSource", "rapperank"."PlaybackSource" IN SHARE ROW EXCLUSIVE MODE`;
    const existingPlayback = await tx.playbackSource.findMany();
    const existingSources = await tx.contentSource.findMany();
    const existingTracks = await tx.track.findMany();
    const existingAlbums = await tx.album.findMany();
    const existingSlots = await tx.albumTrack.findMany();
    const sources = manifest.artists.flatMap((artist) => [
      ...artist.sources.map((source) => ({ ...source, rapperId: artist.rapperId, trackId: null, albumId: null })),
      ...artist.tracks.map((track) => ({ ...track.source, rapperId: null, trackId: track.id, albumId: null })),
      ...artist.albums.map((album) => ({ ...album.source, rapperId: null, trackId: null, albumId: album.id })),
    ]);
    const playback = manifest.artists.flatMap((artist) => [
      ...artist.tracks.flatMap((track) => track.playback.map((item) => ({ ...item, trackId: track.id, albumId: null }))),
      ...artist.albums.flatMap((album) => album.playback.map((item) => ({ ...item, trackId: null, albumId: album.id }))),
    ]);
    for (const source of sources) {
      const previous = existingSources.find((item) => item.id === source.id);
      if (previous && (previous.rapperId !== source.rapperId || previous.trackId !== source.trackId || previous.albumId !== source.albumId || previous.url !== source.url)) throw new Error(`Source identity conflict: ${source.id}`);
    }
    for (const source of playback) {
      const previous = existingPlayback.find((item) => item.id === source.id || (item.provider === source.provider && item.platformId === source.platformId && item.storefront === source.storefront && item.kind === source.kind));
      if (previous && (previous.id !== source.id || previous.trackId !== source.trackId || previous.albumId !== source.albumId || previous.url !== source.url)) throw new Error(`Playback identity conflict: ${source.id}`);
    }
    for (const artist of manifest.artists) for (const track of artist.tracks) {
      const previous = existingTracks.find((item) => item.id === track.id);
      if (previous && (previous.title !== track.title || previous.artistCredit !== track.artistCredit || previous.version !== track.version)) throw new Error(`Reviewed track differs from manifest: ${track.id}`);
    }
    for (const artist of manifest.artists) for (const album of artist.albums) for (const slot of album.tracks) {
      const previous = existingSlots.find((item) => item.albumId === album.id && item.discNumber === slot.discNumber && item.position === slot.position);
      if (previous && previous.trackId !== slot.trackId) throw new Error(`Album slot conflict: ${album.id}/${slot.position}`);
    }
    for (const artist of manifest.artists) for (const album of artist.albums) {
      const previous = existingAlbums.find((item) => item.id === album.id);
      if (previous && (previous.title !== album.title || previous.artistCredit !== album.artistCredit)) throw new Error(`Reviewed album differs from manifest: ${album.id}`);
    }
    for (const artist of manifest.artists) {
      const current = await tx.rapper.findUniqueOrThrow({ where: { id: artist.rapperId } });
      if (current.bio !== artist.expectedBio && current.bio !== artist.bio) throw new Error(`Concurrent profile edit: ${artist.name}`);
      // Reviewed records are immutable to this importer. Re-runs only insert missing rows.
      if (!current.contentReviewedAt) await tx.rapper.update({ where: { id: artist.rapperId }, data: { bio: artist.bio, profileTimeline: artist.timeline, officialLinks: artist.officialLinks, contentReviewedAt: new Date() } });
    }
    // Batch writes keep the remote transaction short; skipDuplicates preserves reviewed rows.
    await tx.track.createMany({ data: manifest.artists.flatMap((artist) => artist.tracks.map((track) => ({ id: track.id, title: track.title, artistCredit: track.artistCredit, version: track.version, durationMs: track.durationMs, reviewStatus: track.reviewStatus, releasedAt: track.releasedAt ? new Date(track.releasedAt) : null }))), skipDuplicates: true });
    await tx.album.createMany({ data: manifest.artists.flatMap((artist) => artist.albums.map((album) => ({ id: album.id, title: album.title, artistCredit: album.artistCredit, reviewStatus: album.reviewStatus, releasedAt: album.releasedAt ? new Date(album.releasedAt) : null }))), skipDuplicates: true });
    await tx.rapperTrack.createMany({ data: manifest.artists.flatMap((artist) => artist.tracks.map((track, sortOrder) => ({ rapperId: artist.rapperId, trackId: track.id, role: track.role, sortOrder }))), skipDuplicates: true });
    await tx.albumTrack.createMany({ data: manifest.artists.flatMap((artist) => artist.albums.flatMap((album) => album.tracks.map((track) => ({ ...track, albumId: album.id })))), skipDuplicates: true });
    await tx.contentSource.createMany({ data: sources, skipDuplicates: true });
    await tx.playbackSource.createMany({ data: playback, skipDuplicates: true });
  }, { timeout: 120000 });
  console.log("Content imported. Existing ratings, favorites and media fields were not modified.");
}
main().catch((error) => { console.error(error instanceof Error ? error.message.replace(/postgres(?:ql)?:\/\/\S+/g, "[redacted]") : "Content import failed"); process.exitCode = 1; }).finally(() => db.$disconnect());
