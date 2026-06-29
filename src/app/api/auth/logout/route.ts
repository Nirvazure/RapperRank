import { createClient } from "@/lib/supabase/server";
import { ok } from "@/lib/server/response";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return ok({ success: true });
}
