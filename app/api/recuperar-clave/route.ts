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
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    // 1️⃣ Verificar empleado
    const { data: empleado } = await supabaseAdmin
      .from('empleados')
      .select('correo')
      .eq('correo', email)
      .maybeSingle()

    if (!empleado) {
      return NextResponse.json(
        { error: 'Empleado no existe' },
        { status: 404 }
      )
    }

    // 2️⃣ Buscar usuario en Auth (PAGINANDO)
    let page = 1
    let usuario: any = null

    while (!usuario) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage: 100,
      })

      if (error) {
        console.error(error)
        return NextResponse.json(
          { error: 'Error listando usuarios Auth' },
          { status: 500 }
        )
      }

      usuario = data.users.find(u => u.email === email)

      if (data.users.length < 100) break
      page++
    }

    if (!usuario) {
      return NextResponse.json(
        { error: 'Usuario no existe en Auth' },
        { status: 404 }
      )
    }

    // 3️⃣ Actualizar contraseña
    await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
      password: nueva,
    })

    // 4️⃣ Marcar como actualizado
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
