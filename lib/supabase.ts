import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Server-side only — uses service role key, never expose to browser.
// Lazily created so the build doesn't require env vars at compile time.
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

// Convenience re-export for callers that used the old `supabase` name
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabase() as never)[prop];
  },
});
