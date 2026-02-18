import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function POST(req: Request) {
  try {

    const supabaseUrl = process.env.SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        { error: "Variables de entorno no configuradas." },
        { status: 500 }
      )
    }

    const supabase = createClient(supabaseUrl, serviceKey)

    const formData = await req.formData()
    const files = formData.getAll("files")

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No se recibieron archivos." },
        { status: 400 }
      )
    }

    const resultados: any[] = []
    let montados = 0
    let noMontados = 0

    for (const file of files as File[]) {

      const nombreArchivo = file.name
      const partes = nombreArchivo.split("_")

      if (partes.length < 2) {
        resultados.push({
          archivo: nombreArchivo,
          estado: "ERROR",
          mensaje: "Formato incorrecto. Debe ser cedula_periodo.pdf"
        })
        noMontados++
        continue
      }

      const cedula = partes[0].trim()
      const periodo = partes[1].replace(".pdf", "").trim()

      const { data: empleado } = await supabase
        .from("empleados")
        .select("*")
        .eq("documento", cedula)
        .single()

      if (!empleado) {
        resultados.push({
          archivo: nombreArchivo,
          estado: "NO MONTADO",
          mensaje: `Empleado ${cedula} no existe`
        })
        noMontados++
        continue
      }

      const buffer = Buffer.from(await file.arrayBuffer())

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
          mensaje: uploadError.message
        })
        noMontados++
        continue
      }

      const { data: publicUrlData } = supabase.storage
        .from("desprendibles")
        .getPublicUrl(`pdfs/${nombreArchivo}`)

      await supabase
        .from("desprendibles")
        .insert({
          empleado_id: empleado.id,
          documento: cedula,
          nombre_empleado: empleado.nombre,
          periodo,
          tipo_pago: "Nómina",
          url_pdf: publicUrlData.publicUrl,
          fecha_subida: new Date().toISOString()
        })

      resultados.push({
        archivo: nombreArchivo,
        estado: "MONTADO",
        mensaje: `Cargado correctamente`
      })

      montados++
    }

    return NextResponse.json({
      resumen: {
        total: files.length,
        montados,
        noMontados
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
