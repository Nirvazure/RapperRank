"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageCircle, Shuffle } from "lucide-react";
import { mockUser } from "@/data/mock-user";
import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  const pathname = usePathname();
  const ratingActive = pathname === "/" || pathname.startsWith("/rank/");
  const communityActive = pathname === "/ranking";
  const profileActive = pathname === "/favorites";
  const fallbackInitial = mockUser.displayName.slice(0, 1).toUpperCase();

  return (
    <header className="flex flex-col gap-5 border-b border-white/10 pb-4 text-white lg:flex-row lg:items-end lg:justify-between">
      <div className="min-w-0">
        <p className="font-mono text-xs font-black uppercase tracking-[0.35em] text-lime-200">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-4xl font-black uppercase leading-[0.86] sm:text-6xl md:text-7xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm font-bold leading-6 text-white/65">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
        <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.06] p-1">
          <Link
            href="/"
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-black uppercase transition",
              ratingActive
                ? "bg-lime-200 text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            <Shuffle className="size-3.5" />
            评分
          </Link>
          <Link
            href="/ranking"
            className={cn(
              "inline-flex h-9 items-center gap-1.5 rounded-md px-3 text-xs font-black uppercase transition",
              communityActive
                ? "bg-lime-200 text-black"
                : "text-white/65 hover:bg-white/10 hover:text-white",
            )}
          >
            <MessageCircle className="size-3.5" />
            社区
          </Link>
        </div>
        <Link
          href="/favorites"
          className={cn(
            "flex min-w-0 items-center gap-3 rounded-lg border px-3 py-2 transition",
            profileActive
              ? "border-lime-200 bg-lime-200 text-black"
              : "border-white/10 bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/10",
          )}
        >
          {mockUser.avatarUrl ? (
            <img
              src={mockUser.avatarUrl}
              alt={mockUser.displayName}
              className="size-9 rounded-md object-cover"
            />
          ) : (
            <div
              className={cn(
                "grid size-9 place-items-center rounded-md font-mono text-sm font-black",
                profileActive ? "bg-black text-lime-200" : "bg-lime-200 text-black",
              )}
            >
              {fallbackInitial}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-black uppercase">
              {mockUser.displayName}
            </p>
            <p
              className={cn(
                "font-mono text-[10px] font-bold uppercase tracking-[0.18em]",
                profileActive ? "text-black/55" : "text-white/40",
              )}
            >
              local profile
            </p>
          </div>
        </Link>
      </div>
    </header>
  );
}
