"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CurationExportPanel } from "@/components/curation/CurationExportPanel";
import { CurationRapperTable } from "@/components/curation/CurationRapperTable";
import { CurationTaskCard } from "@/components/curation/CurationTaskCard";
import { CurationToolbar } from "@/components/curation/CurationToolbar";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { rawRappers } from "@/data/rappers";
import {
  curationOverridesSchema,
  defaultCurationOverrides,
} from "@/features/curation/curation.schema";
import { useCurationStore } from "@/features/curation/curation-store";
import type { CurationOverrides } from "@/features/curation/curation.types";
import {
  applyCurationOverrides,
  buildCurationExport,
  createDefaultRating,
  filterCuratedRappers,
  getCurationSummary,
  getRandomUnprocessedRapper,
  getUnprocessedRappers,
  sortCuratedRappers,
} from "@/features/curation/curation.utils";
import type { RatingDimension } from "@/features/ratings/rating.types";

export function CurationPageClient() {
  const [fileStatus, setFileStatus] = useState("Loading persisted file...");
  const didLoadPersistedFile = useRef(false);
  const searchQuery = useCurationStore((state) => state.searchQuery);
  const regionFilter = useCurationStore((state) => state.regionFilter);
  const tagFilter = useCurationStore((state) => state.tagFilter);
  const showExcluded = useCurationStore((state) => state.showExcluded);
  const sortMode = useCurationStore((state) => state.sortMode);
  const excludedRapperIds = useCurationStore((state) => state.excludedRapperIds);
  const ratingOverrides = useCurationStore((state) => state.ratingOverrides);
  const updatedAtByRapperId = useCurationStore((state) => state.updatedAtByRapperId);
  const currentRapperId = useCurationStore((state) => state.currentRapperId);
  const lastHandledRapperId = useCurationStore((state) => state.lastHandledRapperId);
  const excludeRapper = useCurationStore((state) => state.excludeRapper);
  const restoreRapper = useCurationStore((state) => state.restoreRapper);
  const setRatingOverride = useCurationStore((state) => state.setRatingOverride);
  const resetRatingOverride = useCurationStore((state) => state.resetRatingOverride);
  const resetAllRatings = useCurationStore((state) => state.resetAllRatings);
  const loadOverrides = useCurationStore((state) => state.loadOverrides);
  const clearDraft = useCurationStore((state) => state.clearDraft);
  const setSearchQuery = useCurationStore((state) => state.setSearchQuery);
  const setRegionFilter = useCurationStore((state) => state.setRegionFilter);
  const setTagFilter = useCurationStore((state) => state.setTagFilter);
  const setShowExcluded = useCurationStore((state) => state.setShowExcluded);
  const setSortMode = useCurationStore((state) => state.setSortMode);
  const setCurrentRapperId = useCurationStore((state) => state.setCurrentRapperId);
  const setLastHandledRapperId = useCurationStore(
    (state) => state.setLastHandledRapperId,
  );

  useEffect(() => {
    if (didLoadPersistedFile.current) {
      return;
    }

    didLoadPersistedFile.current = true;
    let cancelled = false;

    async function loadPersistedOverrides() {
      const response = await fetch("/api/curation-overrides");
      const data = await response.json();
      const parsed = curationOverridesSchema.safeParse(data);
      const hasDraft =
        excludedRapperIds.length > 0 || Object.keys(ratingOverrides).length > 0;

      if (cancelled) {
        return;
      }

      if (parsed.success && !hasDraft) {
        loadOverrides(parsed.data);
        setFileStatus("Loaded persisted file");
        return;
      }

      setFileStatus(
        parsed.success
          ? "Using local draft over persisted file"
          : "Using empty curation file",
      );
    }

    void loadPersistedOverrides().catch(() => {
      if (!cancelled) {
        setFileStatus("Using empty curation file");
      }
    });

    return () => {
      cancelled = true;
    };
  }, [excludedRapperIds.length, loadOverrides, ratingOverrides]);

  const overrides: CurationOverrides = useMemo(
    () => ({
      version: 1,
      updatedAt: null,
      excludedRapperIds,
      ratingOverrides,
    }),
    [excludedRapperIds, ratingOverrides],
  );

  const curatedRappers = useMemo(() => {
    return applyCurationOverrides(rawRappers, overrides, { includeExcluded: true }).map(
      (rapper) => ({
        ...rapper,
        curationUpdatedAt: updatedAtByRapperId[rapper.id],
      }),
    );
  }, [overrides, updatedAtByRapperId]);

  const regions = useMemo(() => {
    return [...new Set(rawRappers.map((rapper) => rapper.region))].sort();
  }, []);

  const tags = useMemo(() => {
    return [...new Set(rawRappers.flatMap((rapper) => rapper.tags))].sort();
  }, []);

  const visibleRappers = useMemo(() => {
    return sortCuratedRappers(
      filterCuratedRappers(curatedRappers, {
        searchQuery,
        regionFilter,
        tagFilter,
        showExcluded,
        sortMode,
      }),
      sortMode,
    );
  }, [curatedRappers, regionFilter, searchQuery, showExcluded, sortMode, tagFilter]);

  const summary = useMemo(
    () => getCurationSummary(rawRappers, overrides),
    [overrides],
  );

  const exportData = useMemo(() => {
    return buildCurationExport(rawRappers, overrides);
  }, [overrides]);

  const unprocessedRappers = useMemo(
    () => getUnprocessedRappers(rawRappers, overrides),
    [overrides],
  );

  const currentRapper = useMemo(() => {
    return rawRappers.find((rapper) => rapper.id === currentRapperId);
  }, [currentRapperId]);

  useEffect(() => {
    const currentIsUnprocessed = unprocessedRappers.some(
      (rapper) => rapper.id === currentRapper?.id,
    );

    if ((!currentRapper || !currentIsUnprocessed) && unprocessedRappers.length > 0) {
      setCurrentRapperId(getRandomUnprocessedRapper(rawRappers, overrides)?.id ?? null);
    }
  }, [currentRapper, overrides, setCurrentRapperId, unprocessedRappers]);

  function resetEveryRapper() {
    resetAllRatings(rawRappers.map((rapper) => rapper.id));
  }

  function clearLocalDraft() {
    clearDraft();
    loadOverrides(defaultCurationOverrides);
  }

  function pickRandomUnprocessed(nextOverrides = overrides) {
    setCurrentRapperId(getRandomUnprocessedRapper(rawRappers, nextOverrides)?.id ?? null);
  }

  async function saveOverridesToFile(nextOverrides: CurationOverrides) {
    const response = await fetch("/api/curation-overrides", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nextOverrides),
    });

    if (!response.ok) {
      const detail = await response.text();
      setFileStatus(`Save failed: ${detail}`);
      return undefined;
    }

    const saved = curationOverridesSchema.parse(await response.json());
    loadOverrides(saved);
    setFileStatus("Saved file and reloaded progress");
    return saved;
  }

  async function saveCurrentAndNext(rating: RatingDimension) {
    if (!currentRapper) {
      return;
    }

    const nextOverrides: CurationOverrides = {
      ...overrides,
      ratingOverrides: {
        ...overrides.ratingOverrides,
        [currentRapper.id]: rating,
      },
    };
    const saved = await saveOverridesToFile(nextOverrides);

    if (saved) {
      setRatingOverride(currentRapper.id, rating);
      setLastHandledRapperId(currentRapper.id);
      pickRandomUnprocessed(saved);
    }
  }

  async function deleteCurrentAndNext() {
    if (!currentRapper) {
      return;
    }

    const nextExcludedIds = overrides.excludedRapperIds.includes(currentRapper.id)
      ? overrides.excludedRapperIds
      : [...overrides.excludedRapperIds, currentRapper.id];
    const nextOverrides: CurationOverrides = {
      ...overrides,
      excludedRapperIds: nextExcludedIds,
    };
    const saved = await saveOverridesToFile(nextOverrides);

    if (saved) {
      excludeRapper(currentRapper.id);
      setLastHandledRapperId(currentRapper.id);
      pickRandomUnprocessed(saved);
    }
  }

  function skipCurrent() {
    pickRandomUnprocessed();
  }

  async function undoLast() {
    if (!lastHandledRapperId) {
      return;
    }

    const ratingOverrides = { ...overrides.ratingOverrides };
    delete ratingOverrides[lastHandledRapperId];

    const nextOverrides: CurationOverrides = {
      ...overrides,
      excludedRapperIds: overrides.excludedRapperIds.filter(
        (rapperId) => rapperId !== lastHandledRapperId,
      ),
      ratingOverrides,
    };
    const saved = await saveOverridesToFile(nextOverrides);

    if (saved) {
      resetRatingOverride(lastHandledRapperId);
      restoreRapper(lastHandledRapperId);
      setCurrentRapperId(lastHandledRapperId);
      setLastHandledRapperId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#050505] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-[1800px] gap-5">
        <PageHeader
          eyebrow="data curation"
          title="Curation"
          description="上线前筛选 rapper 数据、删除不保留对象，并为每个 rapper 设定初始评分。"
        />

        <section className="grid gap-3 sm:grid-cols-4">
          <Metric label="total" value={summary.total} />
          <Metric label="retained" value={summary.retained} />
          <Metric label="deleted" value={summary.excluded} />
          <Metric label="rated" value={summary.ratingOverrides} />
        </section>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            className="bg-lime-200 text-black hover:bg-lime-100"
            onClick={resetEveryRapper}
          >
            Reset all ratings
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-white/15 bg-black/30 text-white hover:bg-white/10 hover:text-white"
            onClick={clearLocalDraft}
          >
            Clear draft
          </Button>
          <p className="text-xs font-bold text-white/45">{fileStatus}</p>
        </div>

        <CurationTaskCard
          key={currentRapper?.id ?? "empty"}
          rapper={currentRapper}
          initialRating={
            currentRapper
              ? (ratingOverrides[currentRapper.id] ?? createDefaultRating())
              : createDefaultRating()
          }
          status={fileStatus}
          remainingCount={unprocessedRappers.length}
          onSaveNext={saveCurrentAndNext}
          onDeleteNext={deleteCurrentAndNext}
          onSkip={skipCurrent}
          onRandom={() => pickRandomUnprocessed()}
          onUndoLast={undoLast}
          canUndoLast={Boolean(lastHandledRapperId)}
        />

        <CurationToolbar
          searchQuery={searchQuery}
          regionFilter={regionFilter}
          tagFilter={tagFilter}
          sortMode={sortMode}
          showExcluded={showExcluded}
          regions={regions}
          tags={tags}
          onSearchQueryChange={setSearchQuery}
          onRegionFilterChange={setRegionFilter}
          onTagFilterChange={setTagFilter}
          onSortModeChange={setSortMode}
          onShowExcludedChange={setShowExcluded}
        />

        <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <CurationRapperTable
            rappers={visibleRappers}
            onExclude={excludeRapper}
            onRestore={restoreRapper}
            onChangeRating={setRatingOverride}
            onResetRating={resetRatingOverride}
          />
          <CurationExportPanel
            exportData={exportData}
            onSaved={(saved) => {
              const parsed = curationOverridesSchema.parse(saved);
              loadOverrides(parsed);
              setFileStatus("Saved file and reloaded progress");
            }}
          />
        </div>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-right">
      <p className="font-mono text-3xl font-black text-lime-200">{value}</p>
      <p className="text-xs font-black uppercase text-white/45">{label}</p>
    </div>
  );
}
