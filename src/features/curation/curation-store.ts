"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CurationFilters,
  CurationOverrides,
  CurationSortMode,
} from "@/features/curation/curation.types";
import { createDefaultRating } from "@/features/curation/curation.utils";
import type { RatingDimension } from "@/features/ratings/rating.types";

type CurationState = CurationFilters & {
  excludedRapperIds: string[];
  ratingOverrides: Record<string, RatingDimension>;
  updatedAtByRapperId: Record<string, string>;
  currentRapperId: string | null;
  lastHandledRapperId: string | null;
  hasHydrated: boolean;
  excludeRapper: (rapperId: string) => void;
  restoreRapper: (rapperId: string) => void;
  setRatingOverride: (rapperId: string, ratings: RatingDimension) => void;
  resetRatingOverride: (rapperId: string) => void;
  resetAllRatings: (rapperIds: string[]) => void;
  loadOverrides: (overrides: CurationOverrides) => void;
  clearDraft: () => void;
  setCurrentRapperId: (rapperId: string | null) => void;
  setLastHandledRapperId: (rapperId: string | null) => void;
  setSearchQuery: (searchQuery: string) => void;
  setRegionFilter: (regionFilter: string) => void;
  setTagFilter: (tagFilter: string) => void;
  setShowExcluded: (showExcluded: boolean) => void;
  setSortMode: (sortMode: CurationSortMode) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

const defaultFilters: CurationFilters = {
  searchQuery: "",
  regionFilter: "",
  tagFilter: "",
  showExcluded: false,
  sortMode: "score-desc",
};

export const useCurationStore = create<CurationState>()(
  persist(
    (set) => ({
      ...defaultFilters,
      excludedRapperIds: [],
      ratingOverrides: {},
      updatedAtByRapperId: {},
      currentRapperId: null,
      lastHandledRapperId: null,
      hasHydrated: false,
      excludeRapper: (rapperId) =>
        set((state) => ({
          excludedRapperIds: state.excludedRapperIds.includes(rapperId)
            ? state.excludedRapperIds
            : [...state.excludedRapperIds, rapperId],
          updatedAtByRapperId: {
            ...state.updatedAtByRapperId,
            [rapperId]: new Date().toISOString(),
          },
        })),
      restoreRapper: (rapperId) =>
        set((state) => ({
          excludedRapperIds: state.excludedRapperIds.filter((id) => id !== rapperId),
          updatedAtByRapperId: {
            ...state.updatedAtByRapperId,
            [rapperId]: new Date().toISOString(),
          },
        })),
      setRatingOverride: (rapperId, ratings) =>
        set((state) => ({
          ratingOverrides: {
            ...state.ratingOverrides,
            [rapperId]: ratings,
          },
          updatedAtByRapperId: {
            ...state.updatedAtByRapperId,
            [rapperId]: new Date().toISOString(),
          },
        })),
      resetRatingOverride: (rapperId) =>
        set((state) => {
          const ratingOverrides = { ...state.ratingOverrides };
          delete ratingOverrides[rapperId];

          return {
            ratingOverrides,
            updatedAtByRapperId: {
              ...state.updatedAtByRapperId,
              [rapperId]: new Date().toISOString(),
            },
          };
        }),
      resetAllRatings: (rapperIds) =>
        set((state) => {
          const now = new Date().toISOString();
          const ratingOverrides = Object.fromEntries(
            rapperIds.map((rapperId) => [rapperId, createDefaultRating()]),
          );
          const updatedAtByRapperId = Object.fromEntries(
            rapperIds.map((rapperId) => [rapperId, now]),
          );

          return {
            ratingOverrides,
            updatedAtByRapperId: {
              ...state.updatedAtByRapperId,
              ...updatedAtByRapperId,
            },
          };
        }),
      loadOverrides: (overrides) =>
        set({
          excludedRapperIds: overrides.excludedRapperIds,
          ratingOverrides: overrides.ratingOverrides,
          updatedAtByRapperId: {},
          currentRapperId: null,
          lastHandledRapperId: null,
        }),
      clearDraft: () =>
        set({
          ...defaultFilters,
          excludedRapperIds: [],
          ratingOverrides: {},
          updatedAtByRapperId: {},
          currentRapperId: null,
          lastHandledRapperId: null,
        }),
      setCurrentRapperId: (currentRapperId) => set({ currentRapperId }),
      setLastHandledRapperId: (lastHandledRapperId) => set({ lastHandledRapperId }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),
      setRegionFilter: (regionFilter) => set({ regionFilter }),
      setTagFilter: (tagFilter) => set({ tagFilter }),
      setShowExcluded: (showExcluded) => set({ showExcluded }),
      setSortMode: (sortMode) => set({ sortMode }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "rapperank-curation-draft",
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        regionFilter: state.regionFilter,
        tagFilter: state.tagFilter,
        showExcluded: state.showExcluded,
        sortMode: state.sortMode,
        excludedRapperIds: state.excludedRapperIds,
        ratingOverrides: state.ratingOverrides,
        updatedAtByRapperId: state.updatedAtByRapperId,
        currentRapperId: state.currentRapperId,
        lastHandledRapperId: state.lastHandledRapperId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
