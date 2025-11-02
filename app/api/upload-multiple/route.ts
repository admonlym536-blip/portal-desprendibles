import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdminClient";
import { Buffer } from "node:buffer"; // ✅ importante para Next.js 16

export async function POST(req: Request) {
  // 🔧 Inicializa el cliente de Supabase Admin
  const supabaseAdmin = getSupabaseAdmin();

  try {
    console.log("📥 Recibiendo petición /api/upload-multiple...");

    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No se recibieron archivos." }, { status: 400 });
    }

    const resultados: string[] = [];
    const fechaActual = new Date();
    const mesActual = fechaActual.toLocaleString("es-ES", {
      month: "long",
      year: "numeric",
    });

    for (const file of files) {
      try {
        const nombreArchivo = file.name.replace(".pdf", "");
        const [documento, ...resto] = nombreArchivo.split(/[_-\s]+/);
        const periodo = resto.join(" ") || mesActual;

        console.log(`➡️ Procesando ${documento} - ${periodo}`);

        // ✅ Convierte el archivo en buffer (necesario para Supabase Storage)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 🔍 Buscar empleado
        const { data: empleado, error: empError } = await supabaseAdmin
          .from("empleados")
          .select("id, nombre, documento")
          .eq("documento", documento)
          .single();

        if (empError || !empleado) {
          resultados.push(`⚠️ ${file.name}: empleado ${documento} no encontrado`);
          continue;
        }

        const empleado_id = empleado.id;
        const nombre_empleado = empleado.nombre;
        const fileName = `${documento}_${periodo}.pdf`;

        // 📦 Subir archivo al bucket
        const { error: uploadError } = await supabaseAdmin.storage
          .from("desprendibles")
          .upload(`pdfs/${fileName}`, buffer, {
            upsert: true,
            contentType: "application/pdf",
          });

        if (uploadError) {
          resultados.push(`❌ ${file.name}: error al subir → ${uploadError.message}`);
          continue;
        }

        // 🌐 Obtener URL pública
        const { data: publicUrl } = supabaseAdmin.storage
          .from("desprendibles")
          .getPublicUrl(`pdfs/${fileName}`);

        // 🧾 Registrar en la tabla desprendibles
        const { error: insertError } = await supabaseAdmin.from("desprendibles").insert({
          empleado_id,
          documento,
          nombre_empleado,
          periodo,
          url_pdf: publicUrl.publicUrl,
          tipo_pago: "Quincenal",
        });

        if (insertError) {
          resultados.push(`⚠️ ${file.name}: error al registrar → ${insertError.message}`);
        } else {
          resultados.push(`✅ ${file.name}: subido y registrado correctamente`);
        }
      } catch (innerError: any) {
        console.error("🚨 Error procesando archivo:", innerError);
        resultados.push(`❌ ${file.name}: ${innerError.message}`);
      }
    }

    console.log("✅ Resultados finales:", resultados);

    return new Response(JSON.stringify({ success: true, resultados }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("❌ ERROR GLOBAL EN UPLOAD-MULTIPLE:", error);
    return new Response(JSON.stringify({ error: error.message || "Error desconocido" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
}
