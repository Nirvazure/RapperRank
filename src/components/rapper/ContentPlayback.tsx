"use client";

import { useRapperPlayer } from "@/contexts/RapperPlayerContext";
import { isCheckedSource, isPlayableSource } from "@/features/content/content.policy";
import type { PlaybackSourceView } from "@/features/content/content.types";

const providerNames: Record<string, string> = { apple: "Apple Music", netease: "网易云音乐", qq: "QQ 音乐", storage: "本站" };

export function ContentPlayback({ rapperId, title, sources, showUnavailable = true }: { rapperId: string; title: string; sources: PlaybackSourceView[]; showUnavailable?: boolean }) {
  const { playRapperTrack, playEmbeddedTrack } = useRapperPlayer();
  const preview = sources.find((source) => isPlayableSource(source));
  const links = sources.filter((source) => source.kind === "external" && isCheckedSource(source));
  const unavailable = sources.some((source) => source.kind !== "external" && source.status === "unavailable");
  return <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
    {preview ? <button type="button" className="rounded-md bg-lime-200 px-3 py-2 font-bold text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-lime-200" onClick={() => {
      if (preview.kind === "embed") playEmbeddedTrack({ rapperId, title, src: preview.url });
      else playRapperTrack({ rapperId, title, subtitle: preview.kind === "audio_full" ? "完整歌曲" : `试听片段 · ${preview.durationSeconds ?? "部分"} 秒`, src: preview.url });
    }}>{preview.kind === "audio_full" ? "播放完整歌曲" : `试听${preview.durationSeconds ? ` ${preview.durationSeconds} 秒` : "片段"}`}</button> : showUnavailable ? <span className="text-white/45">{unavailable ? "试听暂不可用" : "试听待核验"}</span> : null}
    {links.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer" className="rounded-md border border-white/20 px-3 py-2 text-white/80 underline-offset-4 hover:underline" title={source.conditions}>听完整版 · {providerNames[source.provider] ?? source.provider}{source.storefront !== "cn" ? `（${source.storefront.toUpperCase()} 区）` : ""}</a>)}
    {!preview && links.length > 0 && <span className="w-full text-[11px] leading-5 text-white/45">{links[0].conditions}</span>}
    {preview && <span className="w-full text-[11px] leading-5 text-white/45">{preview.conditions}{preview.storefront !== "cn" ? ` · ${preview.storefront.toUpperCase()} 区来源，国内可用性以平台为准` : ""} · 核验 {preview.checkedAt?.slice(0, 10)}</span>}
  </div>;
}
