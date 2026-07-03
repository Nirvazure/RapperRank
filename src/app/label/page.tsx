import { LabelPageClient } from "@/components/labels/LabelPageClient";
import { labelDefinitions } from "@/features/labels/label.data";
import { buildLabelViewModels } from "@/features/labels/label.utils";
import { getCachedAllRappers } from "@/features/rappers/rapper.cache";
import { mapRapperRecordToViewModel } from "@/features/rappers/rapper.mapper";
import { resolvePageViewer } from "@/lib/server/viewer";

export default async function LabelPage() {
  const viewer = await resolvePageViewer();
  const records = await getCachedAllRappers();
  const rappers = records.map(mapRapperRecordToViewModel);
  const labels = buildLabelViewModels(labelDefinitions, rappers);
  const firstMemberId = labels.find((label) => label.members.length > 0)?.members[0]?.id;
  const avatarRapper = firstMemberId
    ? rappers.find((rapper) => rapper.id === firstMemberId)
    : undefined;

  return (
    <LabelPageClient
      labels={labels}
      viewer={viewer}
      avatarRapper={avatarRapper}
    />
  );
}
