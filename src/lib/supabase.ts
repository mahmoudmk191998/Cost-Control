import { createClient } from '@supabase/supabase-js'

// Vite exposes env variables prefixed with VITE_ to the client.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  // In dev it's ok to warn; in production you may want to throw.
  console.warn('[supabase] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set.')
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')

export default supabase
