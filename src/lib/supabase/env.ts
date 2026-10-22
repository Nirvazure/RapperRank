function requireEnv(key: string): string {
  const value = process.env[key]?.trim();
  if (!value) throw new Error(`${key} is not configured`);
  return value;
}

export function getSupabaseUrl(): string {
  return requireEnv("SUPABASE_URL");
}

export function getSupabasePublishableKey(): string {
  return requireEnv("SUPABASE_PUBLISHABLE_KEY");
}
