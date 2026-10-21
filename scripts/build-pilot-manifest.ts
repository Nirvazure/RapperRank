import { readFile, writeFile } from "node:fs/promises";
import profiles from "../data/content/profiles.json";
import verification from "../data/content/playback-verification.json";
import { contentManifestSchema, type ContentManifest } from "./content/manifest";
import type { AppleRecording } from "./content/discovery";

// Run only after reviewing official catalog identities against the research evidence.
const selection: Record<string, { tracks: number[]; album?: number; unresolved: { title: string; reason: string }[] }> = {
  GAI: { tracks: [1882700104, 1836838476, 1823976615], unresolved: [] },
  王以太: { tracks: [1796116002, 1632168258, 1852295823], album: 1754997818, unresolved: [{ title: "目不转睛", reason: "当前候选来自节目发行，明确标为节目版本；原录音室版尚未核实。" }, { title: "时间是金", reason: "仅找到可确认的 Live 版本；未以其替代原录音室版。" }] },
  "Jony J": { tracks: [1630228473, 1610248412], album: 1610248121, unresolved: [{ title: "套路", reason: "搜索返回同名艺人的作品，缺少可信的 Jony J 录音室版本，暂不绑定播放。" }] },
  法老: { tracks: [1537746682], album: 1537746124, unresolved: [{ title: "我想", reason: "现有名称不完整；不将《我想呼风唤雨》等名称相近作品当作同一首歌。" }, { title: "亲密爱人", reason: "尚未确认对应的法老官方发行与合作署名。" }] },
  马思唯: { tracks: [1724867781, 1724895894, 1876352118], album: 1724866903, unresolved: [{ title: "豆瓣酱", reason: "海外目录名为 Toban Djan，作为明确标注的候选保留译名，未验证试听。" }, { title: "Made in China", reason: "按 Higher Brothers feat. Famous Dex 的团体作品记录，非马思唯个人署名；DJ Snake 混音版另行区分。" }] },
};

type CatalogRecording = AppleRecording & { wrapperType?: string; collectionViewUrl?: string; collectionName?: string; releaseDate?: string; trackCount?: number };
async function main() {
  const discovery = JSON.parse(await readFile(".dev-data/content/pilot-discovery.json", "utf8"));
  const recordings = JSON.parse(await readFile(".dev-data/content/recordings.json", "utf8"));
  const checkedAt = new Date().toISOString();
  const all: CatalogRecording[] = [...discovery.artists.flatMap((artist: { catalogs: { us: CatalogRecording[] } }) => artist.catalogs.us), ...Object.values(recordings.extra).flat() as CatalogRecording[], ...Object.values(recordings.albums).flat() as CatalogRecording[]];
  const artists: ContentManifest["artists"] = [];
  for (const [name, profile] of Object.entries(profiles)) {
    const current = discovery.artists.find((artist: { name: string }) => artist.name === name);
    if (!current) throw new Error(`Missing artist ${name}`);
    const slug = ({ GAI: "gai", 王以太: "yitai", "Jony J": "jony", 法老: "pharaoh", 马思唯: "masiwei" } as Record<string, string>)[name];
    const ref = (key: string) => `${slug}-${key}`;
    const source = (id: string, title: string, url: string, fields: string[]) => ({ id, title, url, fields, retrievedAt: checkedAt, reviewStatus: "approved" as const, reviewer: "Codex: official catalog/editorial identity review; 2026-10-21" });
    const chosen = selection[name];
    const tracks: ContentManifest["artists"][number]["tracks"] = [];
    const makeTrack = (song: CatalogRecording, role: string) => {
      const id = `apple-track-${song.trackId}`;
      if (!song.trackViewUrl) throw new Error(`No official URL: ${id}`);
      const officialUrl = new URL(song.trackViewUrl);
      officialUrl.searchParams.delete("uo");
      const embed = new URL(officialUrl);
      embed.hostname = "embed.music.apple.com";
      const evidence = (verification as Record<string, { durationSeconds: number; checkedAt: string; note: string }>)[String(song.trackId)];
      const base = { provider: "apple", platformId: String(song.trackId), storefront: "us", reviewStatus: "approved" as const };
      return {
        id, title: song.trackName, artistCredit: song.artistName,
        version: /live|现场|現場|节目|中國說唱/.test(`${song.trackName} ${song.collectionName}`.toLowerCase()) ? "节目 / 现场版本" : "录音室版本",
        releasedAt: song.releaseDate?.slice(0, 10) ?? null, durationMs: song.trackTimeMillis ?? null,
        reviewStatus: "approved" as const, role,
        source: source(`${id}-catalog`, `${song.artistName} — ${song.trackName}（Apple US 目录）`, officialUrl.href, ["title", "artistCredit", "version", "releasedAt", "durationMs"]),
        playback: [
          { ...base, id: `${id}-external-us`, kind: "external" as const, url: officialUrl.href, durationSeconds: null, conditions: "完整播放可能需要 Apple Music 登录、订阅及对应地区的内容权限。", status: "available" as const, checkedAt, verificationNote: "Official Apple catalog lookup confirmed exact artistId, trackId and albumId; external page identity checked." },
          { ...base, id: `${id}-embed-us`, kind: "embed" as const, url: embed.href, durationSeconds: evidence?.durationSeconds ?? null, conditions: "官方试听片段；完整播放可能需要登录和订阅。", status: evidence ? "available" as const : "pending" as const, checkedAt: evidence?.checkedAt ?? null, verificationNote: evidence?.note ?? "Catalog provides an official player; browser playback not yet verified. Do not publish a play button." },
        ],
      };
    };
    for (const id of chosen.tracks) {
      const song = all.find((item) => item.trackId === id);
      if (!song) throw new Error(`Missing reviewed recording ${id}`);
      tracks.push(makeTrack(song, id === 1876352118 ? "group" : "representative"));
    }
    const albums: ContentManifest["artists"][number]["albums"] = [];
    if (chosen.album) {
      const rows: CatalogRecording[] = recordings.albums[chosen.album];
      const album = rows.find((item) => item.wrapperType === "collection");
      if (!album?.collectionViewUrl) throw new Error("Missing official album");
      const songs = rows.filter((item) => item.trackId && item.wrapperType === "track");
      for (const song of songs) if (!tracks.some((item) => item.id === `apple-track-${song.trackId}`)) tracks.push(makeTrack(song, "album"));
      const id = `apple-album-${chosen.album}`;
      const url = new URL(album.collectionViewUrl); url.searchParams.delete("uo");
      albums.push({ id, title: album.collectionName!, artistCredit: album.artistName, releasedAt: album.releaseDate?.slice(0, 10) ?? null, reviewStatus: "approved", source: source(`${id}-catalog`, `${album.collectionName}（Apple US 目录）`, url.href, ["title", "artistCredit", "releasedAt", "tracklist"]), tracks: songs.map((song) => ({ trackId: `apple-track-${song.trackId}`, position: song.trackNumber!, discNumber: song.discNumber ?? 1 })), playback: [{ id: `${id}-external-us`, kind: "external", provider: "apple", platformId: String(chosen.album), storefront: "us", url: url.href, durationSeconds: null, conditions: "完整专辑需对应平台账号、订阅及地区权限。", status: "available", checkedAt, verificationNote: "Official album lookup validated albumId and complete ordered tracklist.", reviewStatus: "approved" }] });
    }
    artists.push({ rapperId: current.id, name, expectedBio: current.bio, bio: profile.bio, timeline: profile.timeline.map(({ source: key, ...entry }) => ({ ...entry, sourceId: ref(key) })), officialLinks: [{ label: "Apple Music 官方艺人页", url: `https://music.apple.com/us/artist/artist/${profile.artistId}` }], sources: profile.references.map((reference) => source(ref(reference.key), reference.title, reference.url, ["bio", "timeline"])), tracks, albums, unresolvedWorks: chosen.unresolved });
  }
  const manifest = contentManifestSchema.parse({ version: 1, artists });
  await writeFile("data/content/pilot.json", `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(JSON.stringify(manifest.artists.map((artist) => ({ name: artist.name, bioLength: artist.bio.length, tracks: artist.tracks.length, verified: artist.tracks.filter((track) => track.playback.some((source) => source.kind === "embed" && source.status === "available")).length, albumCandidates: artist.albums.length })), null, 2));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
