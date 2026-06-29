"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function GitHubLoginButton() {
  return (
    <Button type="button" className="w-full" asChild>
      <Link href="/api/auth/github">使用 GitHub 登录</Link>
    </Button>
  );
}
