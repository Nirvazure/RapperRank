import type { Rapper } from "@/features/rappers/rapper.types";

export type LabelMemberPreview = Pick<Rapper, "id" | "name" | "slug" | "avatarUrl" | "mediaUrl"> & {
  alias?: string;
};

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
