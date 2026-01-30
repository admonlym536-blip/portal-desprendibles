import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ No se encontraron las variables de entorno de Supabase (anon).")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
