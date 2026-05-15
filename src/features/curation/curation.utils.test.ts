import { describe, expect, it } from "vitest";
import type { CurationFilters, CurationOverrides } from "@/features/curation/curation.types";
import { curationRatingSchema } from "@/features/curation/curation.schema";
import {
  applyCurationOverrides,
  buildCurationExport,
  createDefaultRating,
  filterCuratedRappers,
  getRandomUnprocessedRapper,
  getUnprocessedRappers,
  hasDecimalRating,
  getCurationSummary,
} from "@/features/curation/curation.utils";
import type { Rapper } from "@/features/rappers/rapper.types";

const baseRappers: Rapper[] = [
  {
    id: "alpha",
    name: "Alpha MC",
    chineseName: "阿尔法",
    alias: "A",
    labels: ["Label A"],
    region: "Chengdu, China",
    avatarUrl: "/rapper/a.jpg",
    mediaUrl: "/rapper/a.jpg",
    mediaType: "image",
    bio: "Alpha bio",
    shortReview: "Alpha review",
    tags: ["CDC", "Technical"],
    representativeWorks: ["Alpha Song"],
    ratingCount: 10,
    averageRatings: {
      flow: 4,
      lyrics: 4,
      voice: 4,
      technique: 4,
      melody: 4,
      stage: 4,
      ph: 0,
    },
  },
  {
    id: "beta",
    name: "Beta Rapper",
    alias: "Bee",
    region: "Shanghai, China",
    avatarUrl: "/rapper/b.jpg",
    mediaUrl: "/rapper/b.jpg",
    mediaType: "image",
    bio: "Beta bio",
    shortReview: "Beta review",
    tags: ["Jazz Rap"],
    representativeWorks: ["Beta Song"],
    ratingCount: 20,
    averageRatings: {
      flow: 2,
      lyrics: 2,
      voice: 2,
      technique: 2,
      melody: 2,
      stage: 2,
      ph: 1,
    },
  },
];

const defaultOverrides: CurationOverrides = {
  version: 1,
  updatedAt: null,
  excludedRapperIds: [],
  ratingOverrides: {},
};

const defaultFilters: CurationFilters = {
  searchQuery: "",
  regionFilter: "",
  tagFilter: "",
  showExcluded: false,
  sortMode: "score-desc",
};

describe("curation utils", () => {
  it("keeps data unchanged with default overrides", () => {
    const curated = applyCurationOverrides(baseRappers, defaultOverrides);

    expect(curated).toHaveLength(2);
    expect(curated[0]?.averageRatings.flow).toBe(4);
    expect(curated[0]?.isExcluded).toBe(false);
    expect(curated[0]?.hasRatingOverride).toBe(false);
  });

  it("filters excluded rappers by default", () => {
    const curated = applyCurationOverrides(baseRappers, {
      ...defaultOverrides,
      excludedRapperIds: ["alpha"],
    });

    expect(curated.map((rapper) => rapper.id)).toEqual(["beta"]);
  });

  it("applies rating overrides", () => {
    const curated = applyCurationOverrides(baseRappers, {
      ...defaultOverrides,
      ratingOverrides: {
        alpha: createDefaultRating(),
      },
    });

    expect(curated[0]?.averageRatings.flow).toBe(3);
    expect(curated[0]?.hasRatingOverride).toBe(true);
  });

  it("matches search against name, alias, chineseName, and labels", () => {
    const curated = applyCurationOverrides(baseRappers, defaultOverrides);

    expect(
      filterCuratedRappers(curated, { ...defaultFilters, searchQuery: "阿尔法" }),
    ).toHaveLength(1);
    expect(
      filterCuratedRappers(curated, { ...defaultFilters, searchQuery: "bee" }),
    ).toHaveLength(1);
    expect(
      filterCuratedRappers(curated, { ...defaultFilters, searchQuery: "label a" }),
    ).toHaveLength(1);
  });

  it("filters by region", () => {
    const curated = applyCurationOverrides(baseRappers, defaultOverrides);

    expect(
      filterCuratedRappers(curated, {
        ...defaultFilters,
        regionFilter: "Shanghai, China",
      }).map((rapper) => rapper.id),
    ).toEqual(["beta"]);
  });

  it("filters by tag", () => {
    const curated = applyCurationOverrides(baseRappers, defaultOverrides);

    expect(
      filterCuratedRappers(curated, {
        ...defaultFilters,
        tagFilter: "Technical",
      }).map((rapper) => rapper.id),
    ).toEqual(["alpha"]);
  });

  it("shows excluded rappers when requested", () => {
    const curated = applyCurationOverrides(
      baseRappers,
      {
        ...defaultOverrides,
        excludedRapperIds: ["alpha"],
      },
      { includeExcluded: true },
    );

    expect(
      filterCuratedRappers(curated, {
        ...defaultFilters,
        showExcluded: true,
      }).map((rapper) => rapper.id),
    ).toEqual(["alpha", "beta"]);
  });

  it("creates the reset rating value", () => {
    expect(createDefaultRating()).toEqual({
      flow: 3,
      lyrics: 3,
      voice: 3,
      technique: 3,
      melody: 3,
      stage: 3,
      ph: 0,
    });
  });

  it("rejects decimal curation ratings", () => {
    expect(curationRatingSchema.safeParse(createDefaultRating()).success).toBe(true);
    expect(
      curationRatingSchema.safeParse({
        ...createDefaultRating(),
        flow: 3.5,
      }).success,
    ).toBe(false);
    expect(hasDecimalRating({ ...createDefaultRating(), ph: 0.5 })).toBe(true);
  });

  it("returns unprocessed rappers that are not rated or deleted", () => {
    const unprocessed = getUnprocessedRappers(baseRappers, defaultOverrides);

    expect(unprocessed.map((rapper) => rapper.id)).toEqual(["alpha", "beta"]);
  });

  it("excludes rated rappers from the unprocessed pool", () => {
    const unprocessed = getUnprocessedRappers(baseRappers, {
      ...defaultOverrides,
      ratingOverrides: {
        alpha: createDefaultRating(),
      },
    });

    expect(unprocessed.map((rapper) => rapper.id)).toEqual(["beta"]);
  });

  it("excludes deleted rappers from the unprocessed pool", () => {
    const unprocessed = getUnprocessedRappers(baseRappers, {
      ...defaultOverrides,
      excludedRapperIds: ["beta"],
    });

    expect(unprocessed.map((rapper) => rapper.id)).toEqual(["alpha"]);
  });

  it("returns a random unprocessed rapper", () => {
    const selected = getRandomUnprocessedRapper(baseRappers, {
      ...defaultOverrides,
      ratingOverrides: {
        alpha: createDefaultRating(),
      },
    });

    expect(selected?.id).toBe("beta");
  });

  it("exports summary with exclusions and rating overrides", () => {
    const exportData = buildCurationExport(baseRappers, {
      version: 1,
      updatedAt: "2026-05-13T00:00:00.000Z",
      excludedRapperIds: ["beta"],
      ratingOverrides: {
        alpha: createDefaultRating(),
      },
    });

    expect(exportData.summary).toEqual({
      total: 2,
      retained: 1,
      excluded: 1,
      ratingOverrides: 1,
    });
  });

  it("summarizes current curation state", () => {
    expect(
      getCurationSummary(baseRappers, {
        ...defaultOverrides,
        excludedRapperIds: ["beta"],
      }),
    ).toMatchObject({ total: 2, retained: 1, excluded: 1 });
  });
});
