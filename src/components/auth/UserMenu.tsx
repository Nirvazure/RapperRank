"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, User } from "lucide-react";
import { DropdownMenu } from "radix-ui";
import type { ViewerPresentation } from "@/features/user/user.types";
import { cn } from "@/lib/utils";

const localMockViewerEnabled =
  process.env.NODE_ENV !== "production" &&
  process.env.NEXT_PUBLIC_RAPPERRANK_ENABLE_DEV_MOCK_VIEWER === "1";

export function UserMenu({ user }: { user: ViewerPresentation }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const profileActive = pathname === "/favorites";

  if (!user.isAuthenticated) {
    return (
      <Link
        href="/login"
        className="inline-flex h-11 min-w-11 items-center justify-center rounded-md border border-white/15 px-3 text-xs font-black uppercase text-white/80 transition hover:border-white/30 hover:bg-white/10 hover:text-white lg:h-8 lg:min-w-0 lg:text-[11px]"
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
          aria-label={`用户菜单：${user.displayName}`}
          className={cn(
            "flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md border p-1.5 transition outline-none focus-visible:ring-2 focus-visible:ring-lime-200/50 sm:px-2.5",
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
              className="size-8 shrink-0 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-full text-xs font-black",
                profileActive ? "bg-black text-lime-200" : "bg-lime-200 text-black",
              )}
            >
              {initial}
            </div>
          )}
          <span className="hidden max-w-[8rem] truncate text-xs font-black uppercase sm:block">
            {user.displayName}
          </span>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[12rem] max-w-[calc(100vw-1.5rem)] overflow-y-auto rounded-md border border-white/10 bg-[#141414] p-1 text-white shadow-lg"
        >
          <DropdownMenu.Item asChild>
            <Link
              href="/favorites"
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm font-bold outline-none hover:bg-white/10 focus:bg-white/10 lg:min-h-0 lg:px-2.5 lg:text-xs"
            >
              <User className="size-3.5" />
              个人中心
            </Link>
          </DropdownMenu.Item>
          {localMockViewerEnabled ? (
            <DropdownMenu.Item className="flex min-h-11 items-center gap-2 rounded-sm px-3 py-2 text-sm font-bold text-white/45 outline-none lg:min-h-0 lg:px-2.5 lg:text-xs">
              <LogOut className="size-3.5" />
              Local demo user
            </DropdownMenu.Item>
          ) : (
            <DropdownMenu.Item
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm px-3 py-2 text-sm font-bold outline-none hover:bg-white/10 focus:bg-white/10 disabled:opacity-50 lg:min-h-0 lg:px-2.5 lg:text-xs"
              disabled={loggingOut}
              onSelect={(event) => {
                event.preventDefault();
                void handleLogout();
              }}
            >
              <LogOut className="size-3.5" />
              {loggingOut ? "退出中…" : "退出登录"}
            </DropdownMenu.Item>
          )}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
