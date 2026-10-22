"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Images, Library, MessageCircle, Shuffle } from "lucide-react";
import { UserMenu } from "@/components/auth/UserMenu";
import { getMainNavActive } from "@/components/layout/nav";
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
  const { rating, community, label, art } = getMainNavActive(pathname);

  return (
    <header className="relative border-b border-white/10 pb-3 text-white">
      {/* Mobile / tablet: compact identity and a reachable account action. */}
      <div className="relative flex min-h-14 items-center gap-2 pr-14 sm:gap-3 lg:hidden">
        <div className="absolute right-0 top-1/2 z-10 -translate-y-1/2">
          <UserMenu user={user} />
        </div>
          <Link
            href="/"
            className="flex min-h-11 w-14 shrink-0 items-center rounded-md outline-none ring-lime-200/40 transition hover:opacity-90 focus-visible:ring-2 sm:w-20"
          >
            <Image
              src="/logo.png"
              alt="RapperRank"
              width={360}
              height={112}
              className="h-auto w-full"
              priority
            />
          </Link>
        <div className="min-w-0 flex-1">
          <p className="hidden font-mono text-[10px] font-black uppercase tracking-[0.16em] text-lime-200 sm:block">
            {eyebrow}
          </p>
          <h1 className="break-words text-lg font-black uppercase leading-tight sm:mt-1 sm:text-2xl">{title}</h1>
        </div>
      </div>

      {/* Desktop: original left brand + right nav */}
      <div className="hidden lg:flex lg:flex-row lg:items-center lg:justify-between lg:gap-3">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/"
            className="shrink-0 rounded-md outline-none ring-lime-200/40 transition hover:opacity-90 focus-visible:ring-2"
          >
            <Image
              src="/logo.png"
              alt="RapperRank"
              width={360}
              height={112}
              className="h-auto w-32"
              priority
            />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-lime-200">
              {eyebrow}
            </p>
            <h1 className="mt-1 text-4xl font-black uppercase leading-[0.9]">{title}</h1>
            {description ? (
              <p className="mt-2 line-clamp-2 max-w-2xl text-xs font-bold leading-5 text-white/60">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.06] p-1">
            <Link
              href="/"
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-black uppercase transition",
                rating
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
                community
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
                label
                  ? "bg-lime-200 text-black"
                  : "text-white/65 hover:bg-white/10 hover:text-white",
              )}
            >
              <Library className="size-3" />
              厂牌
            </Link>
            <Link
              href="/art"
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[11px] font-black uppercase transition",
                art
                  ? "bg-lime-200 text-black"
                  : "text-white/65 hover:bg-white/10 hover:text-white",
              )}
            >
              <Images className="size-3" />
              Art
            </Link>
          </div>
          <UserMenu user={user} />
        </div>
      </div>
    </header>
  );
}
