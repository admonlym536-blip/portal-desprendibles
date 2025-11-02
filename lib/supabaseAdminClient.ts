import { createClient } from "@supabase/supabase-js";

// ⚙️ Configuración del cliente de Supabase Admin
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// ✅ Exportar una función, no un objeto (requerido por Next.js 16)
export function getSupabaseAdmin() {
  return createClient(supabaseUrl, supabaseServiceKey);
}
