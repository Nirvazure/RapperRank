import type { LabelDefinition, LabelMemberPreview, LabelViewModel } from "@/features/labels/label.types";
import type { Rapper } from "@/features/rappers/rapper.types";

function toMemberPreview(member: Rapper): LabelMemberPreview {
  return {
    id: member.id,
    name: member.name,
    aliases: member.aliases,
    avatarUrl: member.avatarUrl,
    mediaUrl: member.mediaUrl,
  };
}

export function buildLabelViewModels(
  definitions: LabelDefinition[],
  rapperList: Rapper[],
): LabelViewModel[] {
  const rapperBySeedKey = new Map(
    rapperList
      .filter((rapper) => Boolean(rapper.seedKey))
      .map((rapper) => [rapper.seedKey as string, rapper]),
  );

  return [...definitions]
    .sort((first, second) => first.sortOrder - second.sortOrder)
    .map((definition) => {
      const members = definition.memberIds
        .map((memberId) => rapperBySeedKey.get(memberId))
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
