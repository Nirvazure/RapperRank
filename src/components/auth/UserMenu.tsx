"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import type { ViewerPresentation } from "@/features/user/user.types";
import { cn } from "@/lib/utils";

export function UserMenu({ user }: { user: ViewerPresentation }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const profileActive = pathname === "/favorites";

  if (!user.isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex h-8 items-center rounded-md border border-white/15 px-3 text-[11px] font-black uppercase text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white"
      >
        登录
      </Link>
    );
  }

  const initial = (user.displayName || "U").charAt(0).toUpperCase();

  async function handleLogout() {
    setLoggingOut(true);
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        throw new Error("logout failed");
      }
      router.refresh();
      router.push("/");
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          className={cn(
            "flex min-w-0 items-center gap-2 rounded-md border px-2.5 py-1.5 transition outline-none focus-visible:ring-2 focus-visible:ring-lime-200/50",
            profileActive
              ? "border-lime-200 bg-lime-200 text-black"
              : "border-white/10 bg-white/[0.06] text-white hover:border-white/25 hover:bg-white/10",
          )}
        >
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.displayName}
              width={32}
              height={32}
              className="size-8 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div
              className={cn(
                "grid size-8 place-items-center rounded-full text-xs font-black",
                profileActive ? "bg-black text-lime-200" : "bg-lime-200 text-black",
              )}
            >
              {initial}
            </div>
          )}
          <span className="max-w-[8rem] truncate text-xs font-black uppercase">
            {user.displayName}
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-[10rem] overflow-hidden rounded-md border border-white/10 bg-[#141414] p-1 text-white shadow-lg"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/favorites"
              className="flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-bold outline-none hover:bg-white/10 focus:bg-white/10"
            >
              <User className="size-3.5" />
              个人中心
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-sm px-2.5 py-2 text-xs font-bold outline-none hover:bg-white/10 focus:bg-white/10 disabled:opacity-50"
            disabled={loggingOut}
            onSelect={(event) => {
              event.preventDefault();
              void handleLogout();
            }}
          >
            <LogOut className="size-3.5" />
            {loggingOut ? "退出中…" : "退出登录"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
