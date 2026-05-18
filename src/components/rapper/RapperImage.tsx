import Image from "next/image";
import { RAPPER_IMAGE_PLACEHOLDER_LABEL } from "@/features/rappers/rapper.media";

export function RapperImage({
  src,
  alt,
  className,
  priority = false,
}: {
  src?: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  if (!src) {
    return (
      <div className={`flex items-center justify-center bg-neutral-900 text-center ${className ?? ""}`}>
        <div className="space-y-2 px-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-lime-200/70">
            {RAPPER_IMAGE_PLACEHOLDER_LABEL}
          </p>
          <p className="text-xs font-black uppercase text-white/50">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      className={className}
      sizes="(max-width: 768px) 100vw, 50vw"
    />
  );
}
