import { createClient, type SupabaseClient } from '@supabase/supabase-js'

// Real auth + database when these are set at build time; a clearly-labelled demo mode otherwise.
// The anon key is designed to be public: row-level security on the tables is what protects data.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const supabase: SupabaseClient | null =
  url && anon
    ? createClient(url, anon, {
        auth: { flowType: 'pkce', detectSessionInUrl: true, persistSession: true },
      })
    : null

export const hasBackend = Boolean(supabase)

export function redirectUrl() {
  // Land back on the app root; HashRouter takes over from there.
  return window.location.origin + import.meta.env.BASE_URL
}
