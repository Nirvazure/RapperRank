export const PENDING_RAPPER_IMAGE_BASE_URL = "pending-oss://rapper/";

export type RapperImageImportEntry = {
  fileName: string;
  seedKeys?: string[];
  names?: string[];
  aliases?: string[];
};

export type RapperImageImportRecord = {
  id: string;
  seedKey: string | null;
  name: string;
  aliases: string[];
  mediaUrl: string | null;
  avatarUrl: string | null;
};

export type RapperImageImportPlanItem = {
  entry: RapperImageImportEntry;
  matchType: "seedKey" | "name" | "alias";
  rapper: RapperImageImportRecord;
  nextMediaUrl: string;
  nextAvatarUrl: null;
};

export type RapperImageImportIssue = {
  entry: RapperImageImportEntry;
  reason: "unmatched" | "ambiguous";
  matchType?: "seedKey" | "name" | "alias";
  candidates: Array<Pick<RapperImageImportRecord, "id" | "seedKey" | "name">>;
};

export const rapperImageImportEntries: RapperImageImportEntry[] = [
  { fileName: "ansrj.jpg", seedKeys: ["ansrj"], names: ["ANSRJ"] },
  { fileName: "boom.jpg", seedKeys: ["huang-xu", "boom"], names: ["黄旭", "Boom"], aliases: ["黄旭"] },
  { fileName: "bridge.webp", seedKeys: ["bridge-gosh", "bridge"], names: ["Bridge"] },
  { fileName: "danbao.jpg", seedKeys: ["danbao"], names: ["蛋堡", "Danbao"] },
  { fileName: "fox.webp", seedKeys: ["fox-huosi", "fox"], names: ["Fox", "Fox胡斯"] },
  { fileName: "jcole.webp", seedKeys: ["j-cole", "jcole"], names: ["J. Cole", "J Cole"] },
  { fileName: "jellorio.jpg", seedKeys: ["jello-rio", "jellorio"], names: ["Jellorio", "JelloRio李佳隆", "李佳隆"] },
  { fileName: "kafehu.jpg", seedKeys: ["kafe-hu", "kafehu"], names: ["卡夫胡", "Kafehu", "KAFE.HU"], aliases: ["咖啡壶"] },
  { fileName: "kendrick.jpg", seedKeys: ["kendrick-lamar", "kendrick"], names: ["Kendrick Lamar"] },
  { fileName: "mcjin.jpg", seedKeys: ["mc-jin", "mcjin"], names: ["MC Jin"] },
  { fileName: "nicki.jpg", seedKeys: ["nicki-minaj", "nicki"], names: ["Nicki Minaj"] },
  { fileName: "ranzer.jpg", seedKeys: ["ranzer"], names: ["Ranzer"] },
  { fileName: "vava.jpg", seedKeys: ["vava"], names: ["VaVa", "VAVA"] },
  { fileName: "younglego.jpg", seedKeys: ["young-leggo", "youngleggo", "younglego"], names: ["Young Lego", "YoungLeggo"] },
  { fileName: "辉子.webp", names: ["辉子"] },
  { fileName: "满舒克.jpg", names: ["满舒克"] },
];

function normalizeForMatch(value: string): string {
  return value.trim().toLocaleLowerCase("zh-CN");
}

function dedupeRecords(records: RapperImageImportRecord[]) {
  const seen = new Set<string>();
  return records.filter((record) => {
    if (seen.has(record.id)) {
      return false;
    }

    seen.add(record.id);
    return true;
  });
}

function collectMatches(
  rappers: RapperImageImportRecord[],
  values: string[] | undefined,
  pickValues: (rapper: RapperImageImportRecord) => string[],
) {
  if (!values || values.length === 0) {
    return [];
  }

  const normalizedValues = new Set(values.map(normalizeForMatch));
  return dedupeRecords(
    rappers.filter((rapper) =>
      pickValues(rapper).some((value) => normalizedValues.has(normalizeForMatch(value))),
    ),
  );
}

function trimTrailingSlashes(value: string) {
  return value.replace(/\/+$/, "");
}

export function buildRapperImageUrl(fileName: string, baseUrl = PENDING_RAPPER_IMAGE_BASE_URL) {
  return `${trimTrailingSlashes(baseUrl)}/${fileName}`;
}

export function planRapperImageImports(
  rappers: RapperImageImportRecord[],
  options?: { baseUrl?: string },
) {
  const baseUrl = options?.baseUrl ?? PENDING_RAPPER_IMAGE_BASE_URL;
  const planned: RapperImageImportPlanItem[] = [];
  const issues: RapperImageImportIssue[] = [];

  for (const entry of rapperImageImportEntries) {
    const seedKeyMatches = collectMatches(
      rappers,
      entry.seedKeys,
      (rapper) => (rapper.seedKey ? [rapper.seedKey] : []),
    );

    if (seedKeyMatches.length === 1) {
      planned.push({
        entry,
        matchType: "seedKey",
        rapper: seedKeyMatches[0],
        nextMediaUrl: buildRapperImageUrl(entry.fileName, baseUrl),
        nextAvatarUrl: null,
      });
      continue;
    }

    if (seedKeyMatches.length > 1) {
      issues.push({
        entry,
        reason: "ambiguous",
        matchType: "seedKey",
        candidates: seedKeyMatches,
      });
      continue;
    }

    const nameMatches = collectMatches(rappers, entry.names, (rapper) => [rapper.name]);
    if (nameMatches.length === 1) {
      planned.push({
        entry,
        matchType: "name",
        rapper: nameMatches[0],
        nextMediaUrl: buildRapperImageUrl(entry.fileName, baseUrl),
        nextAvatarUrl: null,
      });
      continue;
    }

    if (nameMatches.length > 1) {
      issues.push({
        entry,
        reason: "ambiguous",
        matchType: "name",
        candidates: nameMatches,
      });
      continue;
    }

    const aliasMatches = collectMatches(rappers, entry.aliases, (rapper) => rapper.aliases);
    if (aliasMatches.length === 1) {
      planned.push({
        entry,
        matchType: "alias",
        rapper: aliasMatches[0],
        nextMediaUrl: buildRapperImageUrl(entry.fileName, baseUrl),
        nextAvatarUrl: null,
      });
      continue;
    }

    if (aliasMatches.length > 1) {
      issues.push({
        entry,
        reason: "ambiguous",
        matchType: "alias",
        candidates: aliasMatches,
      });
      continue;
    }

    issues.push({
      entry,
      reason: "unmatched",
      candidates: [],
    });
  }

  return { planned, issues };
}
