export function TrackList({ works }: { works: string[] }) {
  return (
    <div className="grid gap-2">
      {works.map((work, index) => (
        <div
          key={work}
          className="flex items-center justify-between border-b border-white/10 py-2 text-sm"
        >
          <span className="font-bold text-white">{work}</span>
          <span className="font-mono text-xs text-white/45">
            0{index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}
