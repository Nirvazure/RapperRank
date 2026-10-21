"use client";

import { TrackList } from "@/components/rapper/TrackList";
import type { Rapper } from "@/features/rappers/rapper.types";
import { ContentPlayback } from "./ContentPlayback";
import { StorageImage } from "./StorageImage";
import { useRapperPlayer } from "@/contexts/RapperPlayerContext";

const MAX_TOP_HITS = 3;

export function RapperProfilePanel({ rapper }: { rapper: Rapper }) {
  const topHits = rapper.representativeWorks.slice(0, MAX_TOP_HITS);
  const content = rapper.content;
  const { playRapperTrack } = useRapperPlayer();

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950/85 p-3 text-white shadow-2xl shadow-black/30">
      <div className="shrink-0">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">
          TOP HITS
        </p>
        <h2 className="mt-1 text-xl font-black">档案与作品</h2>
      </div>
      <div className="mt-3 min-h-0 flex-1 space-y-5 overflow-auto overscroll-contain pr-1">
        <details className="rounded-md border border-red-300/20 bg-red-300/5 p-3">
          <summary className="cursor-pointer text-sm font-bold text-red-200">认识 {rapper.name}</summary>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-white/80">{rapper.bio}</p>
          {content?.timeline.length ? <ol className="mt-4 space-y-3 border-l border-red-300/30 pl-3">{content.timeline.map((entry) => <li key={`${entry.date}-${entry.text}`} className="text-xs leading-6"><span className="mr-2 font-mono text-red-200">{entry.date}</span>{entry.text}</li>)}</ol> : null}
          <div className="mt-3 flex flex-wrap gap-3">{content?.officialLinks.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-lime-200 underline underline-offset-4">{link.label}</a>)}</div>
          {content?.references.length ? <details className="mt-3 text-xs text-white/50"><summary className="cursor-pointer">资料来源</summary><ul className="mt-2 space-y-2">{content.references.map((source) => <li key={source.id}><a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">{source.title} ↗</a></li>)}</ul></details> : null}
        </details>
        <section aria-label="代表作"><h3 className="mb-2 text-sm font-bold">代表作</h3>
          {content?.tracks.length ? <ul className="divide-y divide-white/10">{content.tracks.map((track) => <li key={track.id} className="py-3"><p className="text-sm font-bold">{track.title}</p><p className="mt-1 text-xs text-white/50">{track.artistCredit} · {track.version}{track.releasedAt ? ` · ${track.releasedAt.slice(0, 4)}` : ""}</p><ContentPlayback rapperId={rapper.id} title={track.title} sources={track.sources} /></li>)}</ul> : <TrackList works={topHits} />}
          {rapper.backgroundAudioUrl ? <button className="mt-3 text-xs text-lime-200 underline underline-offset-4" onClick={() => playRapperTrack({ rapperId: rapper.id, title: `${rapper.name} · 氛围片段`, subtitle: "15 秒片段", src: rapper.backgroundAudioUrl!, coverUrl: rapper.avatarUrl })}>播放现有氛围片段 · 15 秒</button> : null}
        </section>
        {content?.albums.length ? <section aria-label="可试听专辑"><h3 className="mb-2 text-sm font-bold">可试听专辑</h3>{content.albums.map((album) => <details key={album.id} className="mb-2 rounded-md border border-white/10 p-3"><summary className="cursor-pointer text-sm font-bold">{album.title}<span className="ml-2 text-xs font-normal text-white/45">{album.releasedAt?.slice(0, 4)}</span></summary><p className="mt-2 text-xs text-white/50">{album.artistCredit} · 收录曲目试听</p><ContentPlayback rapperId={rapper.id} title={album.title} sources={album.sources} showUnavailable={false} /><ul className="mt-3 space-y-3">{album.tracks.map((track) => <li key={track.id} className="text-xs"><span>{track.title}</span><ContentPlayback rapperId={rapper.id} title={track.title} sources={track.sources} /></li>)}</ul></details>)}</section> : null}
        {content?.gallery.length ? <section aria-label="艺人图集"><h3 className="mb-2 text-sm font-bold">艺人图集</h3><div className="grid grid-cols-2 gap-2">{content.gallery.map((asset) => <figure key={asset.id}><StorageImage src={asset.url} alt={asset.caption} width={320} height={320} className="aspect-square w-full rounded-md object-contain" /><figcaption className="mt-1 text-[11px] text-white/50">{asset.caption} · {asset.attribution}<details className="my-1"><summary className="cursor-pointer">使用说明</summary><p className="mt-1">{asset.rightsBasis}</p></details><a href={asset.sourceUrl} target="_blank" rel="noopener noreferrer" className="mr-2 text-lime-200 underline">图片来源</a>{asset.rightsBasis.includes("CC BY-SA 4.0") ? <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="text-lime-200 underline">CC BY-SA 4.0 许可</a> : null}</figcaption></figure>)}</div></section> : null}
      </div>
    </section>
  );
}
