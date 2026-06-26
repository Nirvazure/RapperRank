import Image from "next/image";
import {
  RAPPER_IMAGE_PLACEHOLDER_LABEL,
  resolveRapperAvatar,
  shouldBypassNextImageOptimization,
} from "@/features/rappers/rapper.media";
import type { Rapper } from "@/features/rappers/rapper.types";

export function RapperAvatar({
  rapper,
  sizeClass = "size-10",
  grayscale = false,
}: {
  rapper: Rapper;
  sizeClass?: string;
  grayscale?: boolean;
}) {
  const avatar = resolveRapperAvatar(rapper);

  if (!avatar.src) {
    return (
      <div className={`flex ${sizeClass} items-center justify-center rounded-md bg-black/35 text-center`}>
        <span className="px-1 font-mono text-[8px] font-black uppercase leading-tight text-white/45">
          {RAPPER_IMAGE_PLACEHOLDER_LABEL}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-md ${sizeClass}`}>
      <Image
        src={avatar.src}
        alt={avatar.alt}
        fill
        unoptimized={shouldBypassNextImageOptimization(avatar.src)}
        className={`object-cover ${grayscale ? "grayscale" : ""}`}
        sizes="64px"
      />
    </div>
  );
}
