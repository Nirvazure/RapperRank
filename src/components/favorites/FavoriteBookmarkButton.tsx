"use client";

import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FavoriteBookmarkButton({
  isFavorite,
  onToggle,
  compact = false,
  inverted = false,
  className = "",
}: {
  isFavorite: boolean;
  onToggle: () => void;
  compact?: boolean;
  inverted?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={isFavorite ? "default" : "outline"}
      size={compact ? "icon-sm" : "icon-lg"}
      aria-label={isFavorite ? "取消收藏" : "收藏"}
      onClick={(event) => {
        event.stopPropagation();
        onToggle();
      }}
      className={`${
        isFavorite
          ? "border-lime-200/40 bg-lime-200 text-black hover:bg-lime-100"
          : inverted
            ? "border-black/15 bg-white/80 text-black hover:bg-white"
            : "border-white/20 bg-black/35 text-white backdrop-blur hover:bg-white/15"
      } ${className}`}
    >
      <Bookmark className={isFavorite ? "size-4 fill-current" : "size-4"} />
    </Button>
  );
}
