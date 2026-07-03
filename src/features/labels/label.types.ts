import type { Rapper } from "@/features/rappers/rapper.types";

export type LabelMemberPreview = Pick<Rapper, "id" | "name" | "aliases" | "avatarUrl" | "mediaUrl">;

export type LabelDefinition = {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  alias: string;
  region: string;
  description: string;
  logoUrl: string;
  themeTag: string;
  memberIds: string[];
  memberDisplayNames: string[];
  memberPlaceholder: string;
  status: "active";
  sortOrder: number;
};

export type LabelViewModel = LabelDefinition & {
  members: LabelMemberPreview[];
  confirmedMemberCount: number;
  hasMembers: boolean;
};

export type RapperLabelPreview = Pick<LabelDefinition, "id" | "name" | "displayName" | "logoUrl">;
