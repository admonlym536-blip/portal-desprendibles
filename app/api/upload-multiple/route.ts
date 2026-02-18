import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const files = formData.getAll("files")

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No se recibieron archivos." },
        { status: 400 }
      )
    }

    const resultados: any[] = []
    let exitosos = 0
    let fallidos = 0

    for (const file of files as File[]) {
      const nombreArchivo = file.name
      const partes = nombreArchivo.split("_")

      // 🔹 Validar formato
      if (partes.length < 2) {
        resultados.push({
          archivo: nombreArchivo,
          estado: "ERROR",
          mensaje: "Formato incorrecto. Debe ser cedula_periodo.pdf"
        })
        fallidos++
        continue
      }

      const cedula = partes[0].trim()
      const periodo = partes[1].replace(".pdf", "").trim()

      // 🔹 Buscar empleado
      const { data: empleado, error: empleadoError } = await supabase
        .from("empleados")
        .select("*")
        .eq("documento", cedula)
        .single()

      if (empleadoError || !empleado) {
        resultados.push({
          archivo: nombreArchivo,
          estado: "NO MONTADO",
          mensaje: `Empleado con documento ${cedula} no existe.`
        })
        fallidos++
        continue
      }

      // 🔹 Convertir archivo
      const buffer = Buffer.from(await file.arrayBuffer())

      // 🔹 Subir a Storage
      const { error: uploadError } = await supabase.storage
        .from("desprendibles")
        .upload(`pdfs/${nombreArchivo}`, buffer, {
          contentType: "application/pdf",
          upsert: true
        })

      if (uploadError) {
        resultados.push({
          archivo: nombreArchivo,
          estado: "ERROR",
          mensaje: `Error subiendo al storage: ${uploadError.message}`
        })
        fallidos++
        continue
      }

      // 🔹 Obtener URL pública
      const { data: publicUrlData } = supabase.storage
        .from("desprendibles")
        .getPublicUrl(`pdfs/${nombreArchivo}`)

      // 🔹 Insertar en tabla
      const { error: insertError } = await supabase
        .from("desprendibles")
        .insert({
          empleado_id: empleado.id,
          documento: cedula,
          nombre_empleado: empleado.nombre,
          periodo: periodo,
          tipo_pago: "Nómina",
          url_pdf: publicUrlData.publicUrl,
          fecha_subida: new Date().toISOString()
        })

      if (insertError) {
        resultados.push({
          archivo: nombreArchivo,
          estado: "ERROR",
          mensaje: `Error insertando en tabla: ${insertError.message}`
        })
        fallidos++
        continue
      }

      resultados.push({
        archivo: nombreArchivo,
        estado: "MONTADO",
        mensaje: `Desprendible cargado correctamente para ${empleado.nombre}`
      })

      exitosos++
    }

    return NextResponse.json({
      resumen: {
        total_archivos: files.length,
        montados: exitosos,
        no_montados: fallidos
      },
      detalles: resultados
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error interno del servidor" },
      { status: 500 }
    )
  }
}
