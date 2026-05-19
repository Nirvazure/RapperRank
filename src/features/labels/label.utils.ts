import { rappers } from "@/data/rappers";
import type { LabelDefinition, LabelMemberPreview, LabelViewModel } from "@/features/labels/label.types";
import type { Rapper } from "@/features/rappers/rapper.types";

function toMemberPreview(member: Rapper): LabelMemberPreview {
  return {
    id: member.id,
    name: member.name,
    slug: member.slug,
    alias: member.alias,
    avatarUrl: member.avatarUrl,
    mediaUrl: member.mediaUrl,
  };
}

export function buildLabelViewModels(
  definitions: LabelDefinition[],
  rapperList: Rapper[] = rappers,
): LabelViewModel[] {
  const rapperById = new Map(rapperList.map((rapper) => [rapper.id, rapper]));

  return [...definitions]
    .sort((first, second) => first.sortOrder - second.sortOrder)
    .map((definition) => {
      const members = definition.memberIds
        .map((memberId) => rapperById.get(memberId))
        .filter((member): member is Rapper => Boolean(member))
        .map(toMemberPreview);

      return {
        ...definition,
        members,
        confirmedMemberCount: members.length,
        hasMembers: members.length > 0,
      };
    });
}
