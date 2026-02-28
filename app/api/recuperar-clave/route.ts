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

    // 🔎 Buscar usuario en Supabase Auth
    const { data: usersData, error: listError } =
      await supabase.auth.admin.listUsers()

    if (listError) {
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
    const { error: updateEmpleadoError } = await supabase
      .from('empleados')
      .update({ debe_cambiar_password: false })
      .eq('correo', email)

    if (updateEmpleadoError) {
      return NextResponse.json(
        { error: 'Contraseña cambiada, pero error al actualizar empleado.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      mensaje: 'Contraseña actualizada correctamente.'
    })

  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    )
  }
}