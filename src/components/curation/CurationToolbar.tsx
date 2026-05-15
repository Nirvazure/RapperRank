"use client";

import type { CurationSortMode } from "@/features/curation/curation.types";

export function CurationToolbar({
  searchQuery,
  regionFilter,
  tagFilter,
  sortMode,
  showExcluded,
  regions,
  tags,
  onSearchQueryChange,
  onRegionFilterChange,
  onTagFilterChange,
  onSortModeChange,
  onShowExcludedChange,
}: {
  searchQuery: string;
  regionFilter: string;
  tagFilter: string;
  sortMode: CurationSortMode;
  showExcluded: boolean;
  regions: string[];
  tags: string[];
  onSearchQueryChange: (value: string) => void;
  onRegionFilterChange: (value: string) => void;
  onTagFilterChange: (value: string) => void;
  onSortModeChange: (value: CurationSortMode) => void;
  onShowExcludedChange: (value: boolean) => void;
}) {
  return (
    <section className="grid gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-4 text-white lg:grid-cols-[minmax(220px,1fr)_180px_180px_180px_auto]">
      <input
        value={searchQuery}
        onChange={(event) => onSearchQueryChange(event.target.value)}
        placeholder="Search rapper, alias, region, tag"
        className="h-10 rounded-md border border-white/10 bg-black/35 px-3 text-sm font-bold outline-none transition placeholder:text-white/35 focus:border-lime-200"
      />
      <select
        value={regionFilter}
        onChange={(event) => onRegionFilterChange(event.target.value)}
        className="h-10 rounded-md border border-white/10 bg-black/35 px-3 text-sm font-bold outline-none focus:border-lime-200"
      >
        <option value="">All regions</option>
        {regions.map((region) => (
          <option key={region} value={region}>
            {region}
          </option>
        ))}
      </select>
      <select
        value={tagFilter}
        onChange={(event) => onTagFilterChange(event.target.value)}
        className="h-10 rounded-md border border-white/10 bg-black/35 px-3 text-sm font-bold outline-none focus:border-lime-200"
      >
        <option value="">All tags</option>
        {tags.map((tag) => (
          <option key={tag} value={tag}>
            {tag}
          </option>
        ))}
      </select>
      <select
        value={sortMode}
        onChange={(event) => onSortModeChange(event.target.value as CurationSortMode)}
        className="h-10 rounded-md border border-white/10 bg-black/35 px-3 text-sm font-bold outline-none focus:border-lime-200"
      >
        <option value="score-desc">Score high</option>
        <option value="score-asc">Score low</option>
        <option value="name-asc">Name A-Z</option>
        <option value="recent-updated">Recent edits</option>
      </select>
      <label className="flex h-10 items-center gap-2 rounded-md border border-white/10 bg-black/35 px-3 text-sm font-black">
        <input
          type="checkbox"
          checked={showExcluded}
          onChange={(event) => onShowExcludedChange(event.target.checked)}
          className="accent-lime-200"
        />
        Show deleted
      </label>
    </section>
  );
}
