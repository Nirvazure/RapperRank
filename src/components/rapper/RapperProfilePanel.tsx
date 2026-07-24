import { TrackList } from "@/components/rapper/TrackList";
import type { Rapper } from "@/features/rappers/rapper.types";

const MAX_TOP_HITS = 3;

export function RapperProfilePanel({ rapper }: { rapper: Rapper }) {
  const topHits = rapper.representativeWorks.slice(0, MAX_TOP_HITS);

  return (
    <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-white/10 bg-zinc-950/85 p-3 text-white shadow-2xl shadow-black/30">
      <div className="shrink-0">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">
          TOP HITS
        </p>
        <h2 className="mt-1 text-xl font-black">金曲列表</h2>
      </div>
      <div className="mt-3 min-h-0 flex-1 overflow-auto">
        <TrackList works={topHits} />
      </div>
    </section>
  );
}
