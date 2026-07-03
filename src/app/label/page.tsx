import { LabelPageClient } from "@/components/labels/LabelPageClient";
import { rappers } from "@/data/rappers";
import { labelDefinitions } from "@/features/labels/label.data";
import { buildLabelViewModels } from "@/features/labels/label.utils";
import { resolvePageViewer } from "@/lib/server/viewer";

export default async function LabelPage() {
  const viewer = await resolvePageViewer();
  const labels = buildLabelViewModels(labelDefinitions, rappers);
  const avatarRapper = labels.find((label) => label.members.length > 0)?.members[0];

  return (
    <LabelPageClient
      labels={labels}
      viewer={viewer}
      avatarRapper={
        avatarRapper ? (rappers.find((rapper) => rapper.id === avatarRapper.id) ?? undefined) : undefined
      }
    />
  );
}
