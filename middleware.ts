import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { SESSION_COOKIE_NAME } from "@/lib/server/session-cookie";

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"));
}

export async function middleware(request: NextRequest) {
  const supabaseResponse = hasSupabaseAuthCookie(request)
    ? await updateSession(request)
    : NextResponse.next({ request });

  if (hasSupabaseAuthCookie(request)) {
    return supabaseResponse;
  }

  if (request.cookies.has(SESSION_COOKIE_NAME)) {
    return supabaseResponse;
  }

  const expires = new Date();
  expires.setDate(expires.getDate() + 30);

  supabaseResponse.cookies.set(SESSION_COOKIE_NAME, crypto.randomUUID(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires,
    path: "/",
  });

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\..*).*)"],
};
