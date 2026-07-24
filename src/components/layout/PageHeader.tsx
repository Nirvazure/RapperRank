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
      {/* Mobile / tablet: centered brand + absolute UserMenu */}
      <div className="relative min-h-[5.5rem] lg:hidden">
        <div className="absolute right-0 top-0 z-10">
          <UserMenu user={user} />
        </div>
        <div className="mx-auto flex max-w-md flex-col items-center px-12 text-center">
          <Link
            href="/"
            className="shrink-0 rounded-md outline-none ring-lime-200/40 transition hover:opacity-90 focus-visible:ring-2"
          >
            <Image
              src="/logo.png"
              alt="RapperRank"
              width={360}
              height={112}
              className="mx-auto h-auto w-28 sm:w-[7.5rem]"
              priority
            />
          </Link>
          <p className="mt-2 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-lime-200">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase leading-[0.9] sm:text-3xl">{title}</h1>
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
