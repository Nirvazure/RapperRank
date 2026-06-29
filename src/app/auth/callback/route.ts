import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SESSION_COOKIE_NAME } from "@/lib/server/session-cookie";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
    }

    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  return NextResponse.redirect(`${origin}/favorites`);
}
