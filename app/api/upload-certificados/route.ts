import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        {
          error: 'Variables de entorno no configuradas.',
        },
        { status: 500 }
      )
    }

    const supabase = createClient(
      supabaseUrl,
      serviceKey
    )

    const formData = await req.formData()

    const files = formData.getAll('files')

    if (!files || files.length === 0) {
      return NextResponse.json(
        {
          error: 'No se recibieron archivos.',
        },
        { status: 400 }
      )
    }

    const resultados: any[] = []

    let montados = 0
    let noMontados = 0

    for (const file of files as File[]) {
      const nombreArchivo = file.name

      const nombreSinExtension =
        nombreArchivo.replace('.pdf', '')

      const partes =
        nombreSinExtension.split('_')

      if (partes.length < 3) {
        resultados.push({
          archivo: nombreArchivo,
          estado: 'ERROR',
          mensaje:
            'Formato incorrecto. Debe ser CEDULA_TIPO_CERTIFICADO_FECHA.pdf',
        })

        noMontados++
        continue
      }

      const cedula = partes[0].trim()

      const fechaArchivo =
        partes[partes.length - 1]

      const tipoCertificado = partes
        .slice(1, partes.length - 1)
        .join('_')

      const { data: empleado } =
        await supabase
          .from('empleados')
          .select('*')
          .eq('documento', cedula)
          .single()

      if (!empleado) {
        resultados.push({
          archivo: nombreArchivo,
          estado: 'NO MONTADO',
          mensaje: `Empleado ${cedula} no existe`,
        })

        noMontados++
        continue
      }

      const buffer = Buffer.from(
        await file.arrayBuffer()
      )

      const { error: uploadError } =
        await supabase.storage
          .from('certificados')
          .upload(
            `certificados_pdf/${nombreArchivo}`,
            buffer,
            {
              contentType: 'application/pdf',
              upsert: true,
            }
          )

      if (uploadError) {
        resultados.push({
          archivo: nombreArchivo,
          estado: 'ERROR',
          mensaje: uploadError.message,
        })

        noMontados++
        continue
      }

      const { data: publicUrlData } =
        supabase.storage
          .from('certificados')
          .getPublicUrl(
            `certificados_pdf/${nombreArchivo}`
          )

      const { error: insertError } =
        await supabase
          .from('certificados')
          .insert({
            empleado_id: empleado.id,
            id_provision:
              empleado.id_provision,
            documento: cedula,
            nombre_empleado:
              empleado.nombre,
            tipo_certificado:
              tipoCertificado,
            url_pdf:
              publicUrlData.publicUrl,
            fecha_subida:
              new Date().toISOString(),
          })

      if (insertError) {
        resultados.push({
          archivo: nombreArchivo,
          estado: 'ERROR',
          mensaje: insertError.message,
        })

        noMontados++
        continue
      }

      resultados.push({
        archivo: nombreArchivo,
        estado: 'MONTADO',
        mensaje:
          'Cargado correctamente',
      })

      montados++
    }

    return NextResponse.json({
      resumen: {
        total: files.length,
        montados,
        noMontados,
      },
      detalles: resultados,
    })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      {
        error:
          error.message ||
          'Error interno del servidor',
      },
      { status: 500 }
    )
  }
}