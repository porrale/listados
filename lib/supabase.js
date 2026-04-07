import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY // <-- Asegurate que este nombre sea igual al del .env

export const supabase = createClient(supabaseUrl, supabaseAnonKey)