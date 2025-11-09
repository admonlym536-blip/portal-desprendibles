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
  const [claveCambiada, setClaveCambiada] = useState(false)

  // ✅ Verificar sesión (si no hay, redirigir)
  useEffect(() => {
    const verificarSesion = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace('/login')
        return
      }
      setUser(data.user)
    }
    verificarSesion()
  }, [router])

  // ✅ Bloquear botón “Atrás” solo si intenta devolverse manualmente
  useEffect(() => {
    const bloquearAtras = () => {
      window.history.pushState(null, '', window.location.href)
    }
    bloquearAtras()
    window.addEventListener('popstate', bloquearAtras)
    return () => window.removeEventListener('popstate', bloquearAtras)
  }, [])

  // ✅ Cambiar contraseña
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
      // 🔹 Actualizar contraseña en Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({ password: nueva })
      if (authError) throw authError

      // 🔹 Actualizar campo en la tabla empleados solo si hay correo
      if (user?.email) {
        await supabase
          .from('empleados')
          .update({ debe_cambiar_password: false })
          .eq('correo', user.email)
      }

      setClaveCambiada(true)
      setMensaje('✅ Tu contraseña fue cambiada correctamente. Serás redirigido al inicio de sesión...')

      // 🔐 Cerrar sesión y redirigir al login luego de 2.5 s
      setTimeout(async () => {
        await supabase.auth.signOut()
        router.replace('/login')
      }, 2500)
    } catch (err) {
      console.error(err)
      setMensaje('❌ Error al cambiar la contraseña.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0C3B75 40%, #0A2E5A 100%)',
        color: 'white',
        fontFamily: 'Segoe UI, Roboto, sans-serif',
      }}
    >
      <div
        style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          width: '100%',
          maxWidth: '420px',
          padding: '2.5rem',
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '120px', height: '120px', position: 'relative' }}>
            <Image
              src="/Logo_Provision.jpg"
              alt="Logo Provisión L&M"
              fill
              style={{ objectFit: 'contain', borderRadius: '10px' }}
              sizes="120px"
            />
          </div>
        </div>

        <h2 style={{ color: '#0C3B75', marginBottom: '0.5rem', fontWeight: 700 }}>
          Cambiar Contraseña
        </h2>
        <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Ingresa y confirma tu nueva contraseña para continuar.
        </p>

        <form
          onSubmit={handleChangePassword}
          style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          <input
            type="password"
            placeholder="Nueva contraseña"
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            required
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: '1px solid #ccc',
              fontSize: '0.95rem',
            }}
          />

          <input
            type="password"
            placeholder="Confirmar nueva contraseña"
            value={confirmar}
            onChange={(e) => setConfirmar(e.target.value)}
            required
            style={{
              padding: '0.8rem 1rem',
              borderRadius: '10px',
              border: '1px solid #ccc',
              fontSize: '0.95rem',
            }}
          />

          <button
            type="submit"
            disabled={cargando}
            style={{
              background: cargando ? '#ccc' : '#0C3B75',
              color: 'white',
              border: 'none',
              padding: '0.9rem',
              borderRadius: '10px',
              cursor: cargando ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
              transition: '0.3s',
            }}
            onMouseOver={(e) => !cargando && (e.currentTarget.style.background = '#154FA2')}
            onMouseOut={(e) => !cargando && (e.currentTarget.style.background = '#0C3B75')}
          >
            {cargando ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </form>

        {mensaje && (
          <p
            style={{
              marginTop: '1rem',
              color: mensaje.startsWith('✅') ? 'green' : 'red',
              fontWeight: 500,
              lineHeight: 1.4,
            }}
          >
            {mensaje}
          </p>
        )}

        <footer style={{ marginTop: '2rem', fontSize: '0.75rem', color: '#777' }}>
          © {new Date().getFullYear()} Provisión L&M S.A.S.
        </footer>
      </div>
    </div>
  )
}
