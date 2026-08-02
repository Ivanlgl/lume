// src/lib/supabase.js
// Creates the Supabase client from environment variables.
// If the variables are missing (e.g. local dev before setup), `supabase` is
// null and Lume falls back to local-only mode instead of crashing.
import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key
  ? createClient(url, key, {
      auth: {
        persistSession: true,      // keep the session in localStorage
        autoRefreshToken: true,    // refresh silently before expiry
        detectSessionInUrl: true,  // handle the OAuth / magic-link redirect
      },
    })
  : null;

if (!supabase && typeof console !== "undefined") {
  console.info("[Lume] Supabase not configured — running in local-only mode.");
}
