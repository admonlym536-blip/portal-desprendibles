'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function CambiarClave() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [nueva, setNueva] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  // ✅ Verificar sesión
  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.replace('/login')
        return
      }

      setUser(data.user)

      // Verificar si realmente debe cambiar contraseña
      const { data: empleado } = await supabase
        .from('empleados')
        .select('debe_cambiar_password')
        .eq('correo', data.user.email)
        .single()

      if (!empleado?.debe_cambiar_password) {
        router.replace('/login')
      }
    }

    verificarSesion()
  }, [router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMensaje('')
    setCargando(true)

    if (nueva !== confirmar) {
      setMensaje('⚠️ Las contraseñas no coinciden.')
      setCargando(false)
      return
    }

    if (nueva.length < 6) {
      setMensaje('⚠️ La nueva contraseña debe tener al menos 6 caracteres.')
      setCargando(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({ password: nueva })
      if (error) throw error

      await supabase
        .from('empleados')
        .update({ debe_cambiar_password: false })
        .eq('correo', user.email)

      setMensaje('✅ Contraseña actualizada. Redirigiendo...')

      setTimeout(async () => {
        await supabase.auth.signOut()
        router.replace('/login')
      }, 1500)

    } catch (err) {
      console.error(err)
      setMensaje('❌ Error al cambiar la contraseña.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: 'linear-gradient(135deg, #0C3B75 40%, #0A2E5A 100%)'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '420px',
        padding: '2.5rem',
        textAlign: 'center'
      }}>

        <Image
          src="/Logo_Provision.jpg"
          alt="Logo"
          width={120}
          height={120}
        />

        <h2 style={{ color: '#0C3B75' }}>Cambiar Contraseña</h2>

        <form onSubmit={handleChangePassword}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
          />

          <button type="submit" disabled={cargando}>
            {cargando ? 'Actualizando...' : 'Actualizar'}
          </button>
        </form>

        {mensaje && <p>{mensaje}</p>}
      </div>
    </div>
  )
}