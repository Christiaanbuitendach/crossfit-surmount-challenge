import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// ----------------------------------------------------------------------------
// Server-only Supabase client using the SERVICE ROLE key.
//
// This client bypasses Row Level Security and must NEVER be imported into a
// client component. All database access in this app happens on the server
// (server components & server actions), so a single admin client is enough.
//
// The client is created lazily on first use (not at import time) so that the
// production build doesn't require runtime secrets to be present.
// ----------------------------------------------------------------------------

let client: SupabaseClient | null = null;

function getClient(): SupabaseClient {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

  client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

/**
 * Lazy proxy that defers client creation until a property is actually accessed,
 * while still letting callers use it like a normal `supabaseAdmin` instance.
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const c = getClient();
    const value = c[prop as keyof SupabaseClient];
    return typeof value === "function" ? value.bind(c) : value;
  },
});
