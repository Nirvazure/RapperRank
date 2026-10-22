// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { getSupabasePublishableKey, getSupabaseUrl } from "./env";

afterEach(() => vi.unstubAllEnvs());

describe("shared Supabase Auth configuration", () => {
  it("uses the shared public configuration without database or admin credentials", () => {
    vi.stubEnv("SUPABASE_URL", " https://auth.example.supabase.co ");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", " sb_publishable_test ");
    expect(getSupabaseUrl()).toBe("https://auth.example.supabase.co");
    expect(getSupabasePublishableKey()).toBe("sb_publishable_test");
  });

  it("rejects a missing or blank publishable key with its canonical name", () => {
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", undefined);
    expect(getSupabasePublishableKey).toThrow("SUPABASE_PUBLISHABLE_KEY is not configured");
    vi.stubEnv("SUPABASE_PUBLISHABLE_KEY", "   ");
    expect(getSupabasePublishableKey).toThrow("SUPABASE_PUBLISHABLE_KEY is not configured");
  });

  it("rejects a missing project URL", () => {
    vi.stubEnv("SUPABASE_URL", undefined);
    expect(getSupabaseUrl).toThrow("SUPABASE_URL is not configured");
  });
});
