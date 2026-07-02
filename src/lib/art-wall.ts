import { artWallOssIndices } from "@/data/art-wall-indices";
import type { ArtWallAlbum } from "@/features/art/art-wall.types";

const LISTEN_ART_WALL_BASE =
  "https://nirvazure-next.oss-cn-hangzhou.aliyuncs.com/album/art";

export function artWallCoverUrl(fileIndex: number): string {
  const n = fileIndex + 1;
  return `${LISTEN_ART_WALL_BASE}/${encodeURIComponent(`album (${n}).jpg`)}`;
}

function makeAlbum(ossIndex: number, id: number): ArtWallAlbum {
  return {
    id,
    sortIndex: id - 1,
    title: `收藏专辑 ${ossIndex + 1}`,
    artist: "Various",
    year: "2020",
    genre: "收藏",
    coverUrl: artWallCoverUrl(ossIndex),
    notes: "静态专辑封面数据，后续可替换为真实专辑信息。",
  };
}

export const artWallAlbums: ArtWallAlbum[] = artWallOssIndices.map((ossIdx, pos) =>
  makeAlbum(ossIdx, pos + 1),
);
