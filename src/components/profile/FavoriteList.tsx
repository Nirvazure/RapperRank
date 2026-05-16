import type { Rapper } from "@/features/rappers/rapper.types";
import {
  RAPPER_IMAGE_PLACEHOLDER_LABEL,
  resolveRapperAvatar,
} from "@/features/rappers/rapper.media";

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
              {(() => {
                const avatar = resolveRapperAvatar(rapper);

                return avatar.src ? (
                  <img
                    src={avatar.src}
                    alt={avatar.alt}
                    className="size-10 rounded-md object-cover grayscale"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-md bg-black/35 text-center">
                    <span className="px-1 font-mono text-[8px] font-black uppercase leading-tight text-white/45">
                      {RAPPER_IMAGE_PLACEHOLDER_LABEL}
                    </span>
                  </div>
                );
              })()}
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
