import { TrackList } from "@/components/rapper/TrackList";
import type { Rapper } from "@/features/rappers/rapper.types";

export function RapperProfilePanel({ rapper }: { rapper: Rapper }) {
  return (
    <section className="h-full min-h-0 space-y-3 overflow-hidden rounded-lg border border-white/10 bg-zinc-950/85 p-3 text-white shadow-2xl shadow-black/30">
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">
          artist notes
        </p>
        <h2 className="mt-1 text-xl font-black uppercase">Works / Bio</h2>
      </div>
      <p className="line-clamp-2 text-sm leading-5 text-white/60">{rapper.bio}</p>
      <TrackList works={rapper.representativeWorks} />
    </section>
  );
}
