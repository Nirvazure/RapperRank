import { LabelPageClient } from "@/components/labels/LabelPageClient";
import { rappers } from "@/data/rappers";
import { labelDefinitions } from "@/features/labels/label.data";
import { buildLabelViewModels } from "@/features/labels/label.utils";

export const dynamic = "force-dynamic";

export default function LabelPage() {
  const labels = buildLabelViewModels(labelDefinitions, rappers);
  const avatarRapper = labels.find((label) => label.members.length > 0)?.members[0];

  return (
    <LabelPageClient
      labels={labels}
      viewerDisplayName="匿名用户"
      avatarRapper={
        avatarRapper ? (rappers.find((rapper) => rapper.id === avatarRapper.id) ?? undefined) : undefined
      }
    />
  );
}
