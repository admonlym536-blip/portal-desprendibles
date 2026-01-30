import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { email, nueva } = await req.json()

    if (!email || !nueva) {
      return NextResponse.json(
        { error: 'Datos incompletos' },
        { status: 400 }
      )
    }

    // 🔍 Verificar empleado
    const { data: empleado } = await supabaseAdmin
      .from('empleados')
      .select('correo')
      .eq('correo', email)
      .single()

    if (!empleado) {
      return NextResponse.json(
        { error: 'Empleado no existe' },
        { status: 404 }
      )
    }

    // 🔍 Buscar usuario en Auth
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error(listError)
      return NextResponse.json(
        { error: 'Error listando usuarios' },
        { status: 500 }
      )
    }

    const usuario = users.users.find((u) => u.email === email)

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no existe en Auth' },
        { status: 404 }
      )
    }

    // 🔐 Actualizar contraseña
    const { error: updateError } =
      await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
        password: nueva,
      })

    if (updateError) {
      console.error(updateError)
      return NextResponse.json(
        { error: 'Error actualizando contraseña' },
        { status: 500 }
      )
    }

    // ✅ Marcar como actualizada
    await supabaseAdmin
      .from('empleados')
      .update({ debe_cambiar_password: false })
      .eq('correo', email)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('RECUPERAR CLAVE ERROR:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}