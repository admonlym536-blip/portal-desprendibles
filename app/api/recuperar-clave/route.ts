import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, nueva } = await req.json()

    if (!email || !nueva) {
      return NextResponse.json(
        { error: 'Correo y nueva contraseña son obligatorios.' },
        { status: 400 }
      )
    }

    // 🔎 Traer hasta 1000 usuarios (no solo 50)
    const { data: usersData, error: listError } =
      await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1000
      })

    if (listError || !usersData?.users) {
      return NextResponse.json(
        { error: 'Error al consultar usuarios.' },
        { status: 500 }
      )
    }

    const usuario = usersData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    if (!usuario) {
      return NextResponse.json(
        { error: 'El correo no está registrado.' },
        { status: 404 }
      )
    }

    // 🔐 Actualizar contraseña
    const { error: updateError } =
      await supabase.auth.admin.updateUserById(usuario.id, {
        password: nueva,
      })

    if (updateError) {
      return NextResponse.json(
        { error: 'No se pudo actualizar la contraseña.' },
        { status: 500 }
      )
    }

    // 🗂 Actualizar tabla empleados
    await supabase
      .from('empleados')
      .update({ debe_cambiar_password: false })
      .eq('correo', email)

    return NextResponse.json({
      ok: true,
      mensaje: 'Contraseña actualizada correctamente.'
    })

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}