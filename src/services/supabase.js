import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

console.log("[supabase] URL prefix:", supabaseUrl.slice(0, 30) || "(vacío)");
console.log("[supabase] Key prefix:", supabaseAnonKey.slice(0, 20) || "(vacío)");
if (supabaseUrl) {
  fetch(`${supabaseUrl}/auth/v1/health`)
    .then((r) => console.log("[supabase] health:", r.status))
    .catch((e) => console.error("[supabase] health FAIL:", e.message));
}

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

let supabaseClient = null;
if (hasSupabaseConfig) {
  try {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
  }
}

export const supabase = supabaseClient;
