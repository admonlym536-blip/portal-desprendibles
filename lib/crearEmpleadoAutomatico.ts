import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

/**
 * ✅ Crea automáticamente el usuario en Supabase Auth cuando se inserta en 'empleados'
 */
export async function crearEmpleadoAutomatico(empleado: {
  correo: string
  nombre: string
  documento: string
  id_provision: string
}) {
  try {
    if (!empleado.correo || !empleado.documento) {
      throw new Error('Faltan campos obligatorios (correo o documento).')
    }

    // Verificar si ya existe en auth
    const { data: existingUser } = await supabaseAdmin
      .from('empleados')
      .select('correo')
      .eq('correo', empleado.correo)
      .maybeSingle()

    if (existingUser) {
      console.log(`⚠️ Usuario ${empleado.correo} ya existe en empleados.`)
      return
    }

    // Crear usuario en Auth
    const { data: user, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: empleado.correo,
      password: 'temporal123',
      email_confirm: true,
      user_metadata: {
        nombre: empleado.nombre,
        documento: empleado.documento,
        id_provision: empleado.id_provision,
      },
    })

    if (userError) throw userError

    console.log(`✅ Usuario creado en Auth: ${empleado.correo} — ${user.user.id}`)

    // Guardar en la tabla empleados
    const { error: insertError } = await supabaseAdmin.from('empleados').insert({
      nombre: empleado.nombre,
      correo: empleado.correo,
      documento: empleado.documento,
      id_provision: empleado.id_provision,
      auth_uuid: user.user.id, // Guarda el uuid
      debe_cambiar_password: true,
    })

    if (insertError) throw insertError

    console.log(`✅ Empleado ${empleado.nombre} registrado correctamente.`)
  } catch (err: any) {
    console.error('❌ Error al crear empleado automático:', err.message)
  }
}
