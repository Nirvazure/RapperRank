import { labelDefinitions } from "@/features/labels/label.data";
import type { RapperLabelPreview } from "@/features/labels/label.types";

function normalizeLabelKey(value: string) {
  return value.trim().toLowerCase();
}

const labelByKey = new Map<string, RapperLabelPreview>();
const labelsByMemberKey = new Map<string, RapperLabelPreview[]>();

for (const definition of labelDefinitions) {
  const preview: RapperLabelPreview = {
    id: definition.id,
    name: definition.name,
    displayName: definition.displayName,
    logoUrl: definition.logoUrl,
  };

  for (const key of [definition.id, definition.slug, definition.name, definition.alias, definition.displayName]) {
    labelByKey.set(normalizeLabelKey(key), preview);
  }

  for (const memberId of definition.memberIds) {
    const existing = labelsByMemberKey.get(memberId) ?? [];
    existing.push(preview);
    labelsByMemberKey.set(memberId, existing);
  }
}

function appendResolvedLabels(
  resolved: RapperLabelPreview[],
  seen: Set<string>,
  keys: string[],
) {
  for (const key of keys) {
    const match = labelByKey.get(normalizeLabelKey(key));
    if (!match || seen.has(match.id)) {
      continue;
    }

    seen.add(match.id);
    resolved.push(match);
  }
}

export function resolveRapperLabels(labelKeys?: string[]): RapperLabelPreview[] {
  if (!labelKeys || labelKeys.length === 0) {
    return [];
  }

  const resolved: RapperLabelPreview[] = [];
  const seen = new Set<string>();
  appendResolvedLabels(resolved, seen, labelKeys);
  return resolved;
}

export function resolveRapperLabelsForArtist(rapper: {
  id: string;
  seedKey?: string;
  labels?: string[];
  tags?: string[];
}): RapperLabelPreview[] {
  const resolved: RapperLabelPreview[] = [];
  const seen = new Set<string>();

  appendResolvedLabels(resolved, seen, rapper.labels ?? []);

  const memberKeys = [rapper.seedKey, rapper.id].filter((value): value is string => Boolean(value));
  for (const memberKey of memberKeys) {
    for (const label of labelsByMemberKey.get(memberKey) ?? []) {
      if (seen.has(label.id)) {
        continue;
      }

      seen.add(label.id);
      resolved.push(label);
    }
  }

  appendResolvedLabels(resolved, seen, rapper.tags ?? []);

  return resolved;
}
