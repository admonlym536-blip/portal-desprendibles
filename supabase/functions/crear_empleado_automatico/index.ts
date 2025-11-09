import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  try {
    const payload = await req.json();
    const record = payload.record;
    console.log("👤 Nuevo empleado recibido:", record);

    const supabaseUrl = Deno.env.get("PROJECT_URL")!;
    const supabaseServiceKey = Deno.env.get("SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!record?.correo) {
      return new Response(JSON.stringify({ error: "Sin correo en el registro" }), { status: 400 });
    }

    // Crear usuario en Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email: record.correo,
      password: "temporal123",
      email_confirm: true,
      user_metadata: {
        nombre: record.nombre,
        documento: record.documento,
      },
    });

    if (error) throw error;
    console.log(`✅ Usuario creado en Auth: ${record.correo}`);

    // Actualizar el user_id en empleados
    const { error: updateError } = await supabase
      .from("empleados")
      .update({ user_id: data.user.id, debe_cambiar_password: true })
      .eq("id", record.id);

    if (updateError) throw updateError;

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    console.error("❌ Error crear_empleado_automatico:", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});
