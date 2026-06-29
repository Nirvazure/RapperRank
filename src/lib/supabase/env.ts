function requireFirst(keys: readonly string[], label: string): string {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) {
      return value;
    }
  }

  throw new Error(`${label} is not configured`);
}

export function getSupabaseUrl(): string {
  return requireFirst(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"], "SUPABASE_URL");
}

export function getSupabaseAnonKey(): string {
  return requireFirst(["SUPABASE_KEY", "NEXT_PUBLIC_SUPABASE_KEY"], "SUPABASE_KEY");
}
