"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { mockUser } from "@/data/mock-user";
import type { RatingDimension, UserRating } from "@/features/ratings/rating.types";
import { MOCK_USER_ID } from "@/lib/constants";

type UserState = {
  selectedRapperId: string;
  favoriteRapperIds: string[];
  myRatings: UserRating[];
  hasHydrated: boolean;
  selectRapper: (rapperId: string) => void;
  toggleFavorite: (rapperId: string) => void;
  rateRapper: (rapperId: string, ratings: RatingDimension) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      selectedRapperId: "kendrick-lamar",
      favoriteRapperIds: mockUser.favoriteRapperIds,
      myRatings: mockUser.ratings,
      hasHydrated: false,
      selectRapper: (rapperId) => set({ selectedRapperId: rapperId }),
      toggleFavorite: (rapperId) =>
        set((state) => ({
          favoriteRapperIds: state.favoriteRapperIds.includes(rapperId)
            ? state.favoriteRapperIds.filter((id) => id !== rapperId)
            : [...state.favoriteRapperIds, rapperId],
        })),
      rateRapper: (rapperId, ratings) =>
        set((state) => {
          const now = new Date().toISOString();
          const existing = state.myRatings.find(
            (rating) => rating.rapperId === rapperId,
          );
          const nextRating: UserRating = {
            userId: MOCK_USER_ID,
            rapperId,
            ratings,
            createdAt: existing?.createdAt ?? now,
            updatedAt: now,
          };

          return {
            myRatings: existing
              ? state.myRatings.map((rating) =>
                  rating.rapperId === rapperId ? nextRating : rating,
                )
              : [...state.myRatings, nextRating],
          };
        }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "rapperank-local-user",
      partialize: (state) => ({
        selectedRapperId: state.selectedRapperId,
        favoriteRapperIds: state.favoriteRapperIds,
        myRatings: state.myRatings,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
