import { TrackList } from "@/components/rapper/TrackList";
import type { Rapper } from "@/features/rappers/rapper.types";

export function RapperProfilePanel({ rapper }: { rapper: Rapper }) {
  return (
    <section className="h-full min-h-0 space-y-4 overflow-hidden rounded-lg border border-white/10 bg-zinc-950/85 p-4 text-white shadow-2xl shadow-black/30">
      <div>
        <p className="font-mono text-xs font-bold uppercase tracking-[0.26em] text-red-300">
          artist notes
        </p>
        <h2 className="mt-2 text-2xl font-black uppercase">Works / Bio</h2>
      </div>
      <p className="line-clamp-2 text-sm leading-6 text-white/60">{rapper.bio}</p>
      <TrackList works={rapper.representativeWorks} />
    </section>
  );
}
