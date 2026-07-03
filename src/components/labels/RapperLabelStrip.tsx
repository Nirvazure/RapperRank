"use client";

import Image from "next/image";
import { resolveRapperLabelsForArtist } from "@/features/labels/label.resolver";
import { shouldBypassNextImageOptimization } from "@/features/rappers/rapper.media";
import type { Rapper } from "@/features/rappers/rapper.types";
import { cn } from "@/lib/utils";

export function RapperLabelStrip({
  rapper,
  variant = "default",
  align = "start",
  inverted = false,
  className,
}: {
  rapper: Pick<Rapper, "id" | "seedKey" | "labels" | "tags">;
  variant?: "default" | "compact" | "featured";
  align?: "start" | "end";
  inverted?: boolean;
  className?: string;
}) {
  const resolved = resolveRapperLabelsForArtist(rapper);

  if (resolved.length === 0) {
    return null;
  }

  const isCompact = variant === "compact";
  const isFeatured = variant === "featured";
  const logoSizeClass = isFeatured ? "size-9" : "size-5";
  const textSizeClass = isCompact ? "text-[10px]" : isFeatured ? "text-sm" : "text-xs";
  const imageSizes = isFeatured ? "36px" : "20px";
  const badgeGapClass = isFeatured ? "gap-2 px-2.5 py-1.5" : "gap-1.5 px-2 py-1";
  const marginClass =
    variant === "compact" ? "mt-1.5" : variant === "featured" ? "mt-0" : "mt-2";

  return (
    <div
      className={cn(
        "flex flex-wrap gap-1.5",
        marginClass,
        align === "end" ? "justify-end" : "justify-start",
        className,
      )}
    >
      {resolved.map((label) => (
        <span
          key={label.id}
          className={`inline-flex max-w-full items-center rounded-md border ${badgeGapClass} ${
            inverted
              ? "border-black/10 bg-black/5 text-black/70"
              : "border-white/10 bg-black/30 text-white/70"
          }`}
        >
          <span className={`relative ${logoSizeClass} shrink-0 overflow-hidden rounded-sm bg-black/20`}>
            <Image
              src={label.logoUrl}
              alt={label.displayName}
              fill
              className="object-cover"
              sizes={imageSizes}
              unoptimized={shouldBypassNextImageOptimization(label.logoUrl)}
            />
          </span>
          <span className={`truncate font-bold uppercase tracking-[0.08em] ${textSizeClass}`}>
            {label.name}
          </span>
        </span>
      ))}
    </div>
  );
}
