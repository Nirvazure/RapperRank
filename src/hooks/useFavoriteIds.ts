"use client";

import { startTransition, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleFavoriteRequest } from "@/features/favorites/favorite.client";

export function useFavoriteIds(initialFavoriteIds: string[]) {
  const router = useRouter();
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(initialFavoriteIds));

  const toggleFavorite = useCallback(
    async (rapperId: string) => {
      const wasFavorite = favoriteIds.has(rapperId);
      const previous = favoriteIds;

      setFavoriteIds((current) => {
        const next = new Set(current);
        if (wasFavorite) {
          next.delete(rapperId);
        } else {
          next.add(rapperId);
        }
        return next;
      });

      try {
        await toggleFavoriteRequest(rapperId, wasFavorite);
        startTransition(() => {
          router.refresh();
        });
      } catch {
        setFavoriteIds(previous);
      }
    },
    [favoriteIds, router],
  );

  return { favoriteIds, toggleFavorite };
}
