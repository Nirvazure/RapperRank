export function RapperTags({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-md border border-white/15 bg-white/10 px-2.5 py-1 text-xs font-black uppercase tracking-[0.18em] text-lime-200"
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
