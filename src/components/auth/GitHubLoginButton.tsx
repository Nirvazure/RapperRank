"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GitHubLoginButton() {
  return (
    <Button type="button" className="h-12 w-full text-base sm:h-10 sm:text-sm" asChild>
      <Link href="/api/auth/github">使用 GitHub 登录</Link>
    </Button>
  );
}
