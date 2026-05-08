import type { Rapper } from "@/features/rappers/rapper.types";

export function FavoriteList({ rappers }: { rappers: Rapper[] }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-black uppercase text-white">我的收藏</h3>
      {rappers.length === 0 ? (
        <p className="text-sm text-white/45">还没有收藏 Rapper。</p>
      ) : (
        <div className="grid gap-2">
          {rappers.map((rapper) => (
            <div
              key={rapper.id}
              className="flex items-center gap-3 rounded-lg border border-white/10 bg-black/35 p-2"
            >
              <img
                src={rapper.avatarUrl}
                alt={rapper.name}
                className="size-10 rounded-md object-cover grayscale"
              />
              <div>
                <p className="text-sm font-black text-white">{rapper.name}</p>
                <p className="text-xs text-white/45">{rapper.region}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
