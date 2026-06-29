"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PageHeader } from "@/components/layout/PageHeader";
import { LabelCard } from "@/components/labels/LabelCard";
import type { LabelViewModel } from "@/features/labels/label.types";
import type { Rapper } from "@/features/rappers/rapper.types";

import type { ViewerPresentation } from "@/features/user/user.types";

export function LabelPageClient({
  labels,
  viewer,
  avatarRapper,
}: {
  labels: LabelViewModel[];
  viewer: ViewerPresentation;
  avatarRapper?: Rapper;
}) {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.fromTo(
        ".label-card",
        { opacity: 0, y: 28 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.06, ease: "power3.out" },
      );
    }, pageRef);

    return () => context.revert();
  }, []);

  return (
    <main ref={pageRef} className="min-h-screen bg-[#050505] px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:54px_54px]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(217,255,0,0.12),transparent_26%),radial-gradient(circle_at_82%_12%,rgba(255,46,91,0.12),transparent_30%),radial-gradient(circle_at_50%_80%,rgba(0,190,255,0.1),transparent_32%)]" />

      <div className="relative mx-auto flex max-w-[1600px] flex-col gap-5">
        <PageHeader
          eyebrow="label index"
          title="Labels"
          description="浏览当前收录的中文说唱厂牌图鉴。此页先展示 Logo、地域、简介与已确认成员，后续会继续纳入成员归属与厂牌排名。"
          user={{
            ...viewer,
            avatarRapper,
          }}
        />

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {labels.map((label) => (
            <LabelCard key={label.id} label={label} />
          ))}
        </section>
      </div>
    </main>
  );
}
