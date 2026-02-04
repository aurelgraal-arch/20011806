import { createClient } from '@supabase/supabase-ts'

export const supabase = createClient(
  'https://vayuwijyxnezpusaqjmz.supabase.co', // URL del tuo progetto Supabase
    'sb_publishable_lYqCuU3Mg1uHE42wo2RMfg_icigb8z5' // Publishable Key
    )