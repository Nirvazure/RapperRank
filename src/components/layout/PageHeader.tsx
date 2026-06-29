"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Library, MessageCircle, Shuffle } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import type { Rapper } from "@/features/rappers/rapper.types";
import type { ViewerPresentation } from "@/features/user/user.types";
import { cn } from "@/lib/utils";

export type ViewerSummary = ViewerPresentation & {
  avatarRapper?: Rapper;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  user,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  user: ViewerSummary;
}) {
  const pathname = usePathname();
  const ratingActive = pathname === "/" || pathname.startsWith("/rank/");
  const communityActive = pathname === "/ranking";
  const labelActive = pathname === "/label";

  return (
    <header className="flex flex-col gap-3 border-b border-white/10 pb-3 text-white lg:flex-row lg:items-center lg:justify-between">
      <div className="flex min-w-0 flex-col gap-3 md:flex-row md:items-center md:gap-4 lg:gap-6">
        <Link
          href="/"
          className="shrink-0 self-start rounded-md outline-none ring-lime-200/40 transition hover:opacity-90 focus-visible:ring-2 md:self-center"
        >
          <Image
            src="/logo.png"
            alt="RapperRank"
            width={360}
            height={112}
            className="h-auto w-28 sm:w-[7.5rem] md:w-32"
            priority
          />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-lime-200">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase leading-[0.9] sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="mt-2 line-clamp-2 max-w-2xl text-xs font-bold leading-5 text-white/60">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center lg:justify-end">
        <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] p-1">
          <Link
            href="/"
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-black uppercase transition",
              ratingActive
                ? "bg-lime-200 text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            <Shuffle className="size-3" />
            评分
          </Link>
          <Link
            href="/ranking"
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-black uppercase transition",
              communityActive
                ? "bg-lime-200 text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            <MessageCircle className="size-3" />
            社区
          </Link>
          <Link
            href="/label"
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-black uppercase transition",
              labelActive
                ? "bg-lime-200 text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            <Library className="size-3" />
            厂牌
          </Link>
        </div>
        <UserMenu user={user} />
      </div>
    </header>
  );
}
