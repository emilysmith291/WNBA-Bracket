import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null | undefined;

/**
 * Returns a Supabase client, or null if NEXT_PUBLIC_SUPABASE_URL /
 * NEXT_PUBLIC_SUPABASE_ANON_KEY aren't set yet. Callers fall back to the
 * static seed data in `lib/data` so the site still renders before Supabase
 * is wired up. Safe to call from both server and client components — the
 * anon key is meant to be public and every table it touches is protected by
 * the RLS policies in supabase/schema.sql.
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  cached = url && key ? createClient(url, key) : null;
  return cached;
}
