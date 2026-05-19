"use client";

import { RapperAvatar } from "@/components/rapper/RapperAvatar";
import type { LabelMemberPreview } from "@/features/labels/label.types";
import type { Rapper } from "@/features/rappers/rapper.types";

export function LabelMemberStrip({
  members,
  placeholder,
}: {
  members: LabelMemberPreview[];
  placeholder: string;
}) {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-black/20 px-3 py-3">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/45">members</p>
        <p className="mt-2 text-sm font-bold text-white/60">{placeholder}</p>
      </div>
    );
  }

  const previewMembers = members.slice(0, 3);
  const overflowCount = members.length - previewMembers.length;

  return (
    <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/45">members</p>
        <span className="rounded-md border border-lime-200/25 bg-lime-200/10 px-2 py-1 text-[10px] font-black uppercase text-lime-200">
          {members.length} confirmed
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="flex items-center -space-x-2">
          {previewMembers.map((member) => (
            <div key={member.id} className="rounded-md border border-black bg-black">
              <RapperAvatar rapper={member as Rapper} sizeClass="size-10" grayscale />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-white">
            {previewMembers.map((member) => member.name).join(" / ")}
          </p>
          {overflowCount > 0 ? (
            <p className="text-xs font-bold text-white/45">+{overflowCount} more members</p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
