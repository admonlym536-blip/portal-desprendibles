import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdminClient"; // ✅ Importa el cliente directamente
import { Buffer } from "node:buffer"; // necesario para Next.js 16

export async function POST(req: Request) {
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
        // 📄 Parsear nombre de archivo
        const nombreArchivo = file.name.replace(".pdf", "");
        const [documento, ...resto] = nombreArchivo.split(/[_-\s]+/);
        const periodo = resto.join(" ") || mesActual;

        console.log(`➡️ Procesando ${documento} - ${periodo}`);

        // ⚙️ Convertir archivo a Buffer (necesario para Supabase Storage)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // 🔍 Buscar empleado en la tabla empleados
        const { data: empleado, error: empError } = await supabaseAdmin
          .from("empleados")
          .select("id, nombre, documento, id_provision")
          .eq("documento", documento)
          .maybeSingle();

        if (empError || !empleado) {
          resultados.push(`⚠️ ${file.name}: empleado ${documento} no encontrado`);
          continue;
        }

        const fileName = `${documento}_${periodo}.pdf`;

        // 📦 Subir PDF a Supabase Storage
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
        const { data: publicUrlData } = supabaseAdmin.storage
          .from("desprendibles")
          .getPublicUrl(`pdfs/${fileName}`);

        const url_pdf = publicUrlData?.publicUrl || "";

        // 🧾 Registrar en la tabla desprendibles
        const { error: insertError } = await supabaseAdmin.from("desprendibles").insert({
          empleado_id: empleado.id,
          id_provision: empleado.id_provision,
          documento,
          nombre_empleado: empleado.nombre,
          periodo,
          url_pdf,
          tipo_pago: "Nómina",
          fecha_subida: new Date().toISOString(),
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

    return NextResponse.json({ resultados }, { status: 200 });
  } catch (error: any) {
    console.error("❌ ERROR GLOBAL EN UPLOAD-MULTIPLE:", error);
    return NextResponse.json(
      { error: error.message || "Error desconocido en la carga masiva" },
      { status: 500 }
    );
  }
}
