import { createClient } from '@supabase/supabase-js'

// ensure environment variables are provided at runtime
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or anon key is missing. Please check your .env files.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
