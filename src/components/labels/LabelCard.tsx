import Image from "next/image";
import { LabelMemberStrip } from "@/components/labels/LabelMemberStrip";
import type { LabelViewModel } from "@/features/labels/label.types";

export function LabelCard({ label }: { label: LabelViewModel }) {
  return (
    <article className="label-card overflow-hidden rounded-lg border border-white/10 bg-white/[0.06]">
      <div className="relative aspect-[16/9] overflow-hidden border-b border-white/10 bg-[#0b0b0b]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(217,255,0,0.16),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(255,46,91,0.14),transparent_28%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02)_0%,rgba(255,255,255,0)_100%)]" />
        <Image
          src={label.logoUrl}
          alt={label.displayName}
          fill
          className="object-cover"
          sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
        />
      </div>
      <div className="space-y-4 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-lime-200">
              {label.themeTag}
            </p>
            <h2 className="mt-1 text-2xl font-black uppercase leading-none text-white">
              {label.name}
            </h2>
            <p className="mt-2 text-sm font-bold text-white/70">{label.alias}</p>
          </div>
          <span className="rounded-md border border-white/10 bg-black/25 px-2 py-1 text-[11px] font-black uppercase text-white/55">
            {label.region}
          </span>
        </div>

        <p className="min-h-12 text-sm font-bold leading-6 text-white/60">{label.description}</p>

        <div className="rounded-lg border border-white/10 bg-black/25 px-3 py-3">
          <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/45">label</p>
          <p className="mt-2 text-lg font-black text-white">{label.displayName}</p>
        </div>

        <LabelMemberStrip members={label.members} placeholder={label.memberPlaceholder} />
      </div>
    </article>
  );
}
